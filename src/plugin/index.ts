/// <reference types="@figma/plugin-typings" />

import { MIGRATIONS } from './migrations';
import { findDeprecatedInstances } from './scan';
import { executeSwaps, resolveTargetComponent, setPropertyValue } from './swap';
import { scanStyleShift, executeStyleShift, resetInstanceColorOverrides, applyManualSelections } from './styleShift';
import type { ManualSelection } from './styleShift';
import { runCrazyDetacher } from './crazyDetacher';

figma.showUI(__html__, { width: 600, height: 800, title: 'Unify' });
figma.ui.postMessage({ type: 'plugin-run' });
addOpen().catch(console.error);

// Notify UI whenever Figma selection changes (used by StyleShiftPanel)
figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'style-shift-selection',
    count: figma.currentPage.selection.length,
  });
});

interface Stats {
  totalSwapped: number;
  totalOpens: number;
  unlockedAchievements: Array<{ id: string; unlockedAt: string }>;
}

const ACHIEVEMENTS: { id: string; label: string; subtitle: string; threshold: number; metric: 'swaps' | 'opens' }[] = [
  { id: 'first-swap',  label: 'Un bon début',    subtitle: 'Premier swap effectué',    threshold: 1,  metric: 'swaps' },
  { id: 'open-5',     label: 'Tu reviens !',              subtitle: 'Déjà 5 ouvertures, ça commence bien.',   threshold: 5,  metric: 'opens' },
  { id: 'open-20',    label: 'Addict (assumé)',           subtitle: '20 ouvertures, Unify entre dans tes habitudes.',              threshold: 20, metric: 'opens' },
  { id: 'open-50',    label: "Sans Unify, c'est pas pareil", subtitle: '50 ouvertures, et toujours au rendez-vous.',                   threshold: 50, metric: 'opens' },
];

async function readStats(): Promise<Stats> {
  const stored = await figma.clientStorage.getAsync('stats') as Partial<Stats> | undefined;
  return { totalSwapped: 0, totalOpens: 0, unlockedAchievements: [], ...(stored ?? {}) };
}

async function checkAndUnlock(stats: Stats, metric: 'swaps' | 'opens', value: number): Promise<void> {
  const unlockedIds = stats.unlockedAchievements.map(u => u.id);
  const newlyUnlocked = ACHIEVEMENTS.filter(
    a => a.metric === metric && !unlockedIds.includes(a.id) && value >= a.threshold
  );
  const now = new Date().toISOString();
  for (const a of newlyUnlocked) stats.unlockedAchievements.push({ id: a.id, unlockedAt: now });
  await figma.clientStorage.setAsync('stats', stats);
  for (const a of newlyUnlocked) {
    figma.ui.postMessage({ type: 'achievement-unlocked', id: a.id, label: a.label, subtitle: a.subtitle, unlockedAt: now });
  }
}

async function addSwaps(count: number): Promise<void> {
  const stats = await readStats();
  stats.totalSwapped += count;
  await checkAndUnlock(stats, 'swaps', stats.totalSwapped);
}

async function addOpen(): Promise<void> {
  const stats = await readStats();
  stats.totalOpens += 1;
  await checkAndUnlock(stats, 'opens', stats.totalOpens);
}

figma.ui.onmessage = async (msg: {
  type: string;
  migrationId?: string;
  scope?: 'selection' | 'document';
  instanceIds?: string[];
  nodeId?: string;
  targetComponentKey?: string;
  mappedProperties?: Record<string, string>;
  theme?: string;
  selections?: ManualSelection[];
}) => {
  if (msg.type === 'get-migrations') {
    figma.ui.postMessage({
      type: 'migrations',
      migrations: MIGRATIONS.map(m => ({ id: m.id, label: m.label, disabled: m.disabled ?? false })),
    });
    return;
  }

  const migration = MIGRATIONS.find(m => m.id === msg.migrationId);

  if (msg.type === 'scan') {
    if (!migration) return;
    const scope = msg.scope ?? 'document';
    try {
      if (scope === 'document') await figma.loadAllPagesAsync();
      const instances = await findDeprecatedInstances(migration, scope);
      const pairsWithKeys = migration.pairs.filter(p => p.deprecatedComponentKey && p.targetComponentKey);
      const targetChecks = await Promise.all(pairsWithKeys.map(p => resolveTargetComponent(p)));
      const targetFound = targetChecks.some(t => t !== null);
      figma.ui.postMessage({ type: 'scan-result', instances, targetFound });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String(e) });
    }
    return;
  }

  if (msg.type === 'execute-swaps') {
    if (!migration || !msg.instanceIds) return;
    try {
      const result = await executeSwaps(migration, msg.instanceIds);
      figma.ui.postMessage({ type: 'swap-done', ...result });
      if (result.swapped > 0) await addSwaps(result.swapped);
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String(e) });
    }
    return;
  }

  if (msg.type === 'preview-request') {
    if (!msg.nodeId) return;
    const mappedProps = msg.mappedProperties ?? {};

    const exportSceneNode = async (n: BaseNode | null): Promise<number[] | null> => {
      if (!n || !('exportAsync' in n)) return null;
      try {
        return Array.from(await (n as SceneNode & ExportMixin).exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 1 },
        }));
      } catch { return null; }
    };

    try {
      const sourceNode = await figma.getNodeByIdAsync(msg.nodeId);

      const [beforeBytes, afterBytes] = await Promise.all([
        exportSceneNode(sourceNode),

        msg.targetComponentKey
          ? (async () => {
              try {
                const comp = await figma.importComponentByKeyAsync(msg.targetComponentKey!);
                let target: ComponentNode;

                if (comp.parent?.type === 'COMPONENT_SET') {
                  const set = comp.parent as ComponentSetNode;
                  const matched = set.children.find((child): child is ComponentNode => {
                    if (child.type !== 'COMPONENT') return false;
                    const vp = child.variantProperties ?? {};
                    return Object.entries(mappedProps).every(([k, v]) => {
                      const vpKey = Object.keys(vp).find(key => key.toLowerCase() === k.toLowerCase());
                      return vpKey !== undefined && vp[vpKey].toLowerCase() === v.toLowerCase();
                    });
                  });
                  target = matched ?? set.defaultVariant;
                } else {
                  target = comp;
                }

                if (sourceNode?.type !== 'INSTANCE') return null;

                // Clone source, reparent to current page, move offscreen
                const clone = sourceNode.clone() as InstanceNode;
                figma.currentPage.appendChild(clone);
                clone.x = -100000;
                clone.y = -100000;

                // Replicate exactly what executeSwaps does
                clone.swapComponent(target);
                for (const [toKey, val] of Object.entries(mappedProps)) {
                  setPropertyValue(clone, toKey, val);
                }

                const bytes = await exportSceneNode(clone);
                clone.remove();
                return bytes;
              } catch { return null; }
            })()
          : Promise.resolve(null),
      ]);

      figma.ui.postMessage({ type: 'preview-result', nodeId: msg.nodeId, targetComponentKey: msg.targetComponentKey, mappedProperties: msg.mappedProperties, beforeBytes, afterBytes });
    } catch {
      figma.ui.postMessage({ type: 'preview-result', nodeId: msg.nodeId, targetComponentKey: msg.targetComponentKey, mappedProperties: msg.mappedProperties, beforeBytes: null, afterBytes: null });
    }
    return;
  }

  if (msg.type === 'focus-node') {
    if (!msg.nodeId) return;
    await figma.loadAllPagesAsync();
    const node = await figma.getNodeByIdAsync(msg.nodeId);
    if (node) {
      let p: BaseNode | null = node;
      while (p && p.type !== 'PAGE') p = p.parent;
      if (p) await figma.setCurrentPageAsync(p as PageNode);
      figma.currentPage.selection = [node as SceneNode];
      figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
    }
    return;
  }

  if (msg.type === 'get-stats') {
    const stats = await readStats();
    const unlockedAchievements = ACHIEVEMENTS
      .filter(a => stats.unlockedAchievements.some(u => u.id === a.id))
      .map(({ id, label, subtitle }) => {
        const entry = stats.unlockedAchievements.find(u => u.id === id)!;
        return { id, label, subtitle, unlockedAt: entry.unlockedAt };
      });
    figma.ui.postMessage({ type: 'stats', unlockedAchievements, totalOpens: stats.totalOpens });
    return;
  }

  if (msg.type === 'get-theme') {
    const theme = await figma.clientStorage.getAsync('theme') as string | undefined;
    figma.ui.postMessage({ type: 'theme', theme: theme ?? 'auto' });
    return;
  }

  if (msg.type === 'set-theme') {
    if (msg.theme) await figma.clientStorage.setAsync('theme', msg.theme);
    return;
  }

  if (msg.type === 'reset-storage') {
    await figma.clientStorage.deleteAsync('stats');
    figma.ui.postMessage({ type: 'storage-reset' });
    figma.ui.postMessage({ type: 'stats', unlockedAchievements: [] });
    return;
  }

  if (msg.type === 'style-shift-scan') {
    const sel = figma.currentPage.selection;
    if (sel.length !== 1) {
      figma.ui.postMessage({ type: 'style-shift-scan-result', items: [] });
      return;
    }
    try {
      const { items, sparkVarNames } = await scanStyleShift(sel[0].id);
      figma.ui.postMessage({ type: 'style-shift-scan-result', items, sparkVarNames });
    } catch (e) {
      console.error('[StyleShift] scan error:', e);
      figma.ui.postMessage({ type: 'style-shift-scan-result', items: [], sparkVarNames: [], error: String(e) });
    }
    return;
  }

  if (msg.type === 'style-shift-reset-instances') {
    const sel = figma.currentPage.selection;
    if (sel.length !== 1) return;
    try {
      const result = await resetInstanceColorOverrides(sel[0].id);
      figma.ui.postMessage({ type: 'style-shift-reset-result', reset: result.reset });
      const { items, sparkVarNames } = await scanStyleShift(sel[0].id);
      figma.ui.postMessage({ type: 'style-shift-scan-result', items, sparkVarNames });
    } catch (e) {
      console.error('[StyleShift] reset error:', e);
      figma.ui.postMessage({ type: 'style-shift-reset-result', reset: 0 });
    }
    return;
  }

  if (msg.type === 'style-shift-execute') {
    const sel = figma.currentPage.selection;
    if (sel.length !== 1) return;
    try {
      const result = await executeStyleShift(sel[0].id);
      figma.ui.postMessage({ type: 'style-shift-execute-result', converted: result.converted });
      const { items, sparkVarNames } = await scanStyleShift(sel[0].id);
      figma.ui.postMessage({ type: 'style-shift-scan-result', items, sparkVarNames });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String(e) });
    }
    return;
  }

  if (msg.type === 'style-shift-apply-manual') {
    const sel = figma.currentPage.selection;
    if (sel.length !== 1 || !msg.selections?.length) return;
    try {
      const result = await applyManualSelections(msg.selections);
      figma.ui.postMessage({ type: 'style-shift-execute-result', converted: result.converted });
      const { items, sparkVarNames } = await scanStyleShift(sel[0].id);
      figma.ui.postMessage({ type: 'style-shift-scan-result', items, sparkVarNames });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String(e) });
    }
    return;
  }

  if (msg.type === 'crazy-detacher-run') {
    const scope = (msg as { type: string; scope?: string }).scope === 'selection' ? 'selection' : 'page';
    try {
      const selectionNodes = scope === 'selection' ? figma.currentPage.selection : undefined;
      const result = await runCrazyDetacher(scope, selectionNodes);
      figma.ui.postMessage({ type: 'crazy-detacher-result', ...result });
    } catch (e) {
      figma.ui.postMessage({ type: 'crazy-detacher-error', message: String(e) });
    }
    return;
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
