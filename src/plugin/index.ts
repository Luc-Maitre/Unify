/// <reference types="@figma/plugin-typings" />

import { MIGRATIONS } from './migrations';
import { findDeprecatedInstances } from './scan';
import { executeSwaps, resolveTargetComponent } from './swap';

figma.showUI(__html__, { width: 420, height: 600, title: 'Unify' });

figma.ui.onmessage = async (msg: {
  type: string;
  migrationId?: string;
  scope?: 'selection' | 'document';
  instanceIds?: string[];
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

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
