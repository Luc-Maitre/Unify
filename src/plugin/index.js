"use strict";
/// <reference types="@figma/plugin-typings" />
Object.defineProperty(exports, "__esModule", { value: true });
const migrations_1 = require("./migrations");
const scan_1 = require("./scan");
const swap_1 = require("./swap");
figma.showUI(__html__, { width: 420, height: 600, title: 'Unify' });
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'get-migrations') {
        figma.ui.postMessage({
            type: 'migrations',
            migrations: migrations_1.MIGRATIONS.map(m => ({ id: m.id, label: m.label, disabled: m.disabled ?? false })),
        });
        return;
    }
    const migration = migrations_1.MIGRATIONS.find(m => m.id === msg.migrationId);
    if (msg.type === 'scan') {
        if (!migration)
            return;
        const scope = msg.scope ?? 'document';
        try {
            if (scope === 'document')
                await figma.loadAllPagesAsync();
            const instances = await (0, scan_1.findDeprecatedInstances)(migration, scope);
            const pairsWithKeys = migration.pairs.filter(p => p.deprecatedComponentKey && p.targetComponentKey);
            const targetChecks = await Promise.all(pairsWithKeys.map(p => (0, swap_1.resolveTargetComponent)(p)));
            const targetFound = targetChecks.some(t => t !== null);
            figma.ui.postMessage({ type: 'scan-result', instances, targetFound });
        }
        catch (e) {
            figma.ui.postMessage({ type: 'error', message: String(e) });
        }
        return;
    }
    if (msg.type === 'execute-swaps') {
        if (!migration || !msg.instanceIds)
            return;
        try {
            const result = await (0, swap_1.executeSwaps)(migration, msg.instanceIds);
            figma.ui.postMessage({ type: 'swap-done', ...result });
        }
        catch (e) {
            figma.ui.postMessage({ type: 'error', message: String(e) });
        }
        return;
    }
    if (msg.type === 'cancel') {
        figma.closePlugin();
    }
};
