"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyValue = getPropertyValue;
exports.buildDeprecatedKeyMap = buildDeprecatedKeyMap;
exports.findDeprecatedInstances = findDeprecatedInstances;
function getPropertyValue(node, namePrefix) {
    try {
        const props = node.componentProperties;
        for (const key of Object.keys(props)) {
            if (key.toLowerCase().startsWith(namePrefix.toLowerCase())) {
                const val = props[key];
                if (val.type === 'VARIANT')
                    return val.value;
            }
        }
    }
    catch (_) { }
    return null;
}
// Expand each deprecated key to all variant keys in its component set
async function buildDeprecatedKeyMap(pairs) {
    const map = new Map();
    for (const pair of pairs) {
        if (!pair.deprecatedComponentKey)
            continue;
        try {
            const comp = await figma.importComponentByKeyAsync(pair.deprecatedComponentKey);
            if (comp.parent?.type === 'COMPONENT_SET') {
                for (const child of comp.parent.children) {
                    if (child.type === 'COMPONENT')
                        map.set(child.key, pair);
                }
            }
            else {
                map.set(comp.key, pair);
            }
        }
        catch (_) {
            map.set(pair.deprecatedComponentKey, pair);
        }
    }
    return map;
}
async function findDeprecatedInstances(migration, scope) {
    const results = [];
    const pairByKey = await buildDeprecatedKeyMap(migration.pairs);
    async function walk(node, pageName) {
        if (node.type === 'INSTANCE') {
            const main = await node.getMainComponentAsync();
            if (main && pairByKey.has(main.key)) {
                const pair = pairByKey.get(main.key);
                const parentName = node.parent && 'name' in node.parent ? node.parent.name : '—';
                const properties = {};
                for (const mapping of pair.propertyMappings) {
                    const val = getPropertyValue(node, mapping.from);
                    if (val !== null)
                        properties[mapping.from] = val;
                }
                results.push({ id: node.id, name: node.name, pageName, parentName, properties });
            }
        }
        if ('children' in node) {
            for (const child of node.children) {
                await walk(child, pageName);
            }
        }
    }
    if (scope === 'selection') {
        for (const node of figma.currentPage.selection) {
            await walk(node, figma.currentPage.name);
        }
    }
    else {
        for (const page of figma.root.children) {
            for (const node of page.children) {
                await walk(node, page.name);
            }
        }
    }
    return results;
}
