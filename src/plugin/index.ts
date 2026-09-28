/// <reference types="@figma/plugin-typings" />

import { MIGRATIONS } from './migrations';
import { findDeprecatedInstances } from './scan';
import { executeSwaps, resolveTargetComponent, setPropertyValue } from './swap';

figma.showUI(__html__, { width: 600, height: 800, title: 'Unify' });
figma.ui.postMessage({ type: 'plugin-run' });

figma.ui.onmessage = async (msg: {
  type: string;
  migrationId?: string;
  scope?: 'selection' | 'document';
  instanceIds?: string[];
  nodeId?: string;
  targetComponentKey?: string;
  mappedProperties?: Record<string, string>;
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

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
