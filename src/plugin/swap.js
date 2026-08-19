"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPropertyValue = setPropertyValue;
exports.resolveTargetComponent = resolveTargetComponent;
exports.executeSwaps = executeSwaps;
const scan_1 = require("./scan");
function setPropertyValue(node, namePrefix, value) {
    try {
        const props = node.componentProperties;
        for (const key of Object.keys(props)) {
            if (key.toLowerCase().startsWith(namePrefix.toLowerCase())) {
                node.setProperties({ [key]: value });
                return;
            }
        }
    }
    catch (_) { }
}
async function resolveTargetComponent(pair) {
    try {
        const comp = await figma.importComponentByKeyAsync(pair.targetComponentKey);
        // Always use the default variant so setProperties can switch to the correct one
        if (comp.parent?.type === 'COMPONENT_SET') {
            return comp.parent.defaultVariant;
        }
        return comp;
    }
    catch (_) { }
    return null;
}
async function executeSwaps(migration, instanceIds) {
    const pairByKey = await (0, scan_1.buildDeprecatedKeyMap)(migration.pairs);
    // Pre-resolve target components (one per pair)
    const targetByPair = new Map();
    for (const pair of migration.pairs) {
        if (!pair.targetComponentKey)
            continue;
        const target = await resolveTargetComponent(pair);
        if (target)
            targetByPair.set(pair, target);
    }
    const targetByDeprecatedKey = new Map([...pairByKey.entries()].flatMap(([variantKey, pair]) => {
        const target = targetByPair.get(pair);
        return target ? [[variantKey, target]] : [];
    }));
    let swapped = 0;
    let failed = 0;
    for (const id of instanceIds) {
        const node = await figma.getNodeByIdAsync(id);
        if (!node || node.type !== 'INSTANCE') {
            failed++;
            continue;
        }
        const main = await node.getMainComponentAsync();
        if (!main) {
            failed++;
            continue;
        }
        const target = targetByDeprecatedKey.get(main.key);
        const pair = pairByKey.get(main.key);
        if (!target || !pair) {
            failed++;
            continue;
        }
        const captured = {};
        for (const mapping of pair.propertyMappings) {
            const val = (0, scan_1.getPropertyValue)(node, mapping.from);
            if (val !== null)
                captured[mapping.from] = val;
        }
        try {
            node.swapComponent(target);
            for (const mapping of pair.propertyMappings) {
                const val = captured[mapping.from];
                if (val !== undefined)
                    setPropertyValue(node, mapping.to, val);
            }
            swapped++;
        }
        catch (_) {
            failed++;
        }
    }
    return { swapped, failed };
}
