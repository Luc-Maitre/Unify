import { Migration, ComponentPair } from './migrations';
import { buildDeprecatedKeyMap, getPropertyValue } from './scan';

export function setPropertyValue(node: InstanceNode, namePrefix: string, value: string): void {
  try {
    const props = node.componentProperties;
    for (const key of Object.keys(props)) {
      if (key.toLowerCase().startsWith(namePrefix.toLowerCase())) {
        node.setProperties({ [key]: value });
        return;
      }
    }
  } catch (_) {}
}

export async function resolveTargetComponent(pair: ComponentPair): Promise<ComponentNode | null> {
  try {
    const comp = await figma.importComponentByKeyAsync(pair.targetComponentKey);
    // Always use the default variant so setProperties can switch to the correct one
    if (comp.parent?.type === 'COMPONENT_SET') {
      return (comp.parent as ComponentSetNode).defaultVariant;
    }
    return comp;
  } catch (_) {}
  return null;
}

export async function executeSwaps(
  migration: Migration,
  instanceIds: string[]
): Promise<{ swapped: number; failed: number }> {
  const pairByKey = await buildDeprecatedKeyMap(migration.pairs);

  // Pre-resolve target components (one per pair)
  const targetByPair = new Map<ComponentPair, ComponentNode>();
  for (const pair of migration.pairs) {
    if (!pair.targetComponentKey) continue;
    const target = await resolveTargetComponent(pair);
    if (target) targetByPair.set(pair, target);
  }

  const targetByDeprecatedKey = new Map<string, ComponentNode>(
    [...pairByKey.entries()].flatMap(([variantKey, pair]) => {
      const target = targetByPair.get(pair);
      return target ? [[variantKey, target]] : [];
    })
  );

  let swapped = 0;
  let failed = 0;

  for (const id of instanceIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (!node || node.type !== 'INSTANCE') { failed++; continue; }

    const main = await node.getMainComponentAsync();
    if (!main) { failed++; continue; }

    const target = targetByDeprecatedKey.get(main.key);
    const pair = pairByKey.get(main.key);
    if (!target || !pair) { failed++; continue; }

    const captured: Record<string, string> = {};
    for (const mapping of pair.propertyMappings) {
      const val = getPropertyValue(node, mapping.from);
      if (val !== null) captured[mapping.from] = val;
    }

    try {
      node.swapComponent(target);
      for (const mapping of pair.propertyMappings) {
        const val = captured[mapping.from];
        if (val !== undefined) setPropertyValue(node, mapping.to, val);
      }
      swapped++;
    } catch (_) {
      failed++;
    }
  }

  return { swapped, failed };
}
