/// <reference types="@figma/plugin-typings" />

// ── Public types (shared with UI via postMessage) ──────────────────────────

export type ComponentKind = 'local' | 'remote' | 'spark';

export interface StyleItem {
  nodeId: string;
  nodeName: string;
  styleName: string;
  /** Style name after prefix stripping and token renaming. */
  targetName: string;
  type: 'fill' | 'stroke';
  /** null = not inside any instance */
  componentKind: ComponentKind | null;
  hasMatch: boolean;
}

// ── Name transformation ────────────────────────────────────────────────────

function transformStyleName(name: string): string {
  return name
    .replace(/^Light\//, '')
    .replace(/\bPrimary\b/g, 'Main')
    .replace(/\bSecondary\b/g, 'Support');
}

// ── Component kind detection ──────────────────────────────────────────────────

// Cache by component key (all instances of the same component share a key)
const _compKindCache = new Map<string, ComponentKind>();
// Cache by instance id to avoid duplicate getMainComponentAsync calls in Promise.all
const _instanceKindPromise = new Map<string, Promise<ComponentKind | null>>();

function getComponentKind(instance: InstanceNode): Promise<ComponentKind | null> {
  if (_instanceKindPromise.has(instance.id)) return _instanceKindPromise.get(instance.id)!;

  const promise = (async (): Promise<ComponentKind | null> => {
    try {
      const comp = await instance.getMainComponentAsync();
      if (!comp) return null;
      if (_compKindCache.has(comp.key)) return _compKindCache.get(comp.key)!;
      // 'spark' upgrade happens later in scanStyleShift via variable name matching
      const kind: ComponentKind = comp.remote ? 'remote' : 'local';
      _compKindCache.set(comp.key, kind);
      return kind;
    } catch {
      return null;
    }
  })();

  _instanceKindPromise.set(instance.id, promise);
  return promise;
}

// ── Node walker ───────────────────────────────────────────────────────────────

interface StyleRef {
  nodeId: string;
  nodeName: string;
  styleId: string;
  type: 'fill' | 'stroke';
  componentKind: ComponentKind | null;
}

function collectRefs(node: SceneNode, out: StyleRef[], componentKind: ComponentKind | null): void {
  if ('fillStyleId' in node) {
    const sid = (node as { fillStyleId: string | symbol }).fillStyleId;
    if (sid && typeof sid === 'string') {
      out.push({ nodeId: node.id, nodeName: node.name, styleId: sid, type: 'fill', componentKind });
    }
  }
  if ('strokeStyleId' in node) {
    const sid = (node as { strokeStyleId: string | symbol }).strokeStyleId;
    if (sid && typeof sid === 'string') {
      out.push({ nodeId: node.id, nodeName: node.name, styleId: sid, type: 'stroke', componentKind });
    }
  }
}

async function walk(node: SceneNode, out: StyleRef[], componentKind: ComponentKind | null): Promise<void> {
  let selfKind = componentKind;
  if (node.type === 'INSTANCE') {
    selfKind = await getComponentKind(node as InstanceNode);
  }

  collectRefs(node, out, selfKind);

  if (!('children' in node)) return;

  const childKind = node.type === 'INSTANCE'
    ? (selfKind ?? await getComponentKind(node as InstanceNode))
    : selfKind;

  await Promise.all(
    (node as ChildrenMixin).children.map(child => walk(child as SceneNode, out, childKind)),
  );
}

// ── Async style resolution ─────────────────────────────────────────────────

type RawItem = Omit<StyleItem, 'hasMatch'>;

async function refsToRawItems(refs: StyleRef[]): Promise<RawItem[]> {
  const results = await Promise.all(
    refs.map(async ref => {
      const style = await figma.getStyleByIdAsync(ref.styleId);
      if (style?.type !== 'PAINT') return null;
      return {
        nodeId: ref.nodeId,
        nodeName: ref.nodeName,
        styleName: style.name,
        targetName: transformStyleName(style.name),
        type: ref.type,
        componentKind: ref.componentKind,
      } satisfies RawItem;
    }),
  );
  return results.filter((r): r is RawItem => r !== null);
}

// ── Variable cache ────────────────────────────────────────────────────────

// Store promises (not booleans) to avoid race conditions with parallel findVariable calls
let _localVarsPromise: Promise<Variable[]> | null = null;
let _libVarsPromise: Promise<LibraryVariable[]> | null = null;
let _sparkVarNamesPromise: Promise<Set<string>> | null = null;
const _cache = new Map<string, Variable | null>();

function resetCaches(): void {
  _localVarsPromise = null;
  _libVarsPromise = null;
  _sparkVarNamesPromise = null;
  _cache.clear();
  _compKindCache.clear();
  _instanceKindPromise.clear();
}

function getLocalVars(): Promise<Variable[]> {
  if (!_localVarsPromise) {
    _localVarsPromise = figma.variables.getLocalVariablesAsync('COLOR');
  }
  return _localVarsPromise;
}

// Returns the set of variable names belonging to the Spark Design System library.
// Used to upgrade 'remote' component instances to 'spark' during scan.
function getSparkVarNames(): Promise<Set<string>> {
  if (_sparkVarNamesPromise) return _sparkVarNamesPromise;
  _sparkVarNamesPromise = (async (): Promise<Set<string>> => {
    try {
      const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
      const sparkCols = cols.filter(c => c.libraryName === 'Spark Design System');
      const arrays = await Promise.all(
        sparkCols.map(c => figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key)),
      );
      return new Set(arrays.flat().map(v => v.name));
    } catch {
      return new Set();
    }
  })();
  return _sparkVarNamesPromise;
}

function getLibVars(): Promise<LibraryVariable[]> {
  if (!_libVarsPromise) {
    _libVarsPromise = (async () => {
      try {
        const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
        const arrays = await Promise.all(
          cols.map(c => figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key)),
        );
        return arrays.flat();
      } catch (e) {
        console.error('[StyleShift] loadLibVars error:', e);
        return [];
      }
    })();
  }
  return _libVarsPromise;
}

async function findVariable(name: string): Promise<Variable | null> {
  if (_cache.has(name)) return _cache.get(name)!;

  const [localVars, libVars] = await Promise.all([getLocalVars(), getLibVars()]);

  const local = localVars.find(v => v.name === name);
  if (local) { _cache.set(name, local); return local; }

  const libVar = libVars.find(v => v.name === name);
  if (libVar) {
    try {
      const imported = await figma.variables.importVariableByKeyAsync(libVar.key);
      _cache.set(name, imported);
      return imported;
    } catch { /* fall through */ }
  }

  _cache.set(name, null);
  return null;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function scanStyleShift(nodeId: string): Promise<{ items: StyleItem[]; sparkVarNames: string[] }> {
  resetCaches();
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.type === 'DOCUMENT' || node.type === 'PAGE') return { items: [], sparkVarNames: [] };

  const refs: StyleRef[] = [];
  await walk(node as SceneNode, refs, null);

  const raw = await refsToRawItems(refs);

  const sparkVarNamesSet = await getSparkVarNames();

  const items = await Promise.all(
    raw.map(async item => {
      const hasMatch = (await findVariable(item.targetName)) !== null;
      // A remote instance whose style maps to a Spark variable is a Spark component instance.
      const componentKind =
        item.componentKind === 'remote' && sparkVarNamesSet.has(item.targetName)
          ? ('spark' as ComponentKind)
          : item.componentKind;
      return { ...item, componentKind, hasMatch };
    }),
  );

  return { items, sparkVarNames: Array.from(sparkVarNamesSet).sort() };
}

export async function resetInstanceColorOverrides(rootNodeId: string): Promise<{ reset: number }> {
  const root = await figma.getNodeByIdAsync(rootNodeId);
  if (!root || root.type === 'DOCUMENT' || root.type === 'PAGE') return { reset: 0 };

  interface InstanceRef { nodeId: string; type: 'fill' | 'stroke'; instanceAncestorId: string; }
  const instanceRefs: InstanceRef[] = [];

  async function walkForReset(node: SceneNode, currentInstanceId: string | null): Promise<void> {
    const effectiveInstanceId = node.type === 'INSTANCE' ? node.id : currentInstanceId;
    if (effectiveInstanceId !== null) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const n = node as any;
      if ('fillStyleId' in node && n.fillStyleId && typeof n.fillStyleId === 'string')
        instanceRefs.push({ nodeId: node.id, type: 'fill', instanceAncestorId: effectiveInstanceId });
      if ('strokeStyleId' in node && n.strokeStyleId && typeof n.strokeStyleId === 'string')
        instanceRefs.push({ nodeId: node.id, type: 'stroke', instanceAncestorId: effectiveInstanceId });
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }
    if (!('children' in node)) return;
    const nextId = node.type === 'INSTANCE' ? node.id : effectiveInstanceId;
    await Promise.all((node as ChildrenMixin).children.map(c => walkForReset(c as SceneNode, nextId)));
  }

  await walkForReset(root as SceneNode, null);

  let reset = 0;

  for (const ref of instanceRefs) {
    const instanceNode = await figma.getNodeByIdAsync(ref.instanceAncestorId);
    if (!instanceNode || instanceNode.type !== 'INSTANCE') continue;

    const mainComp = await (instanceNode as InstanceNode).getMainComponentAsync();
    if (!mainComp) continue;

    const targetNode = await figma.getNodeByIdAsync(ref.nodeId);
    if (!targetNode) continue;

    // Build path from instanceNode to targetNode via .parent (synchronous)
    let pathValid = true;
    const path: number[] = [];
    let current: BaseNode = targetNode;
    while (current.id !== instanceNode.id) {
      const parent = current.parent;
      if (!parent || !('children' in parent)) { pathValid = false; break; }
      const idx = (parent as ChildrenMixin).children.findIndex(c => c.id === current.id);
      if (idx === -1) { pathValid = false; break; }
      path.unshift(idx);
      current = parent;
    }
    if (!pathValid) continue;

    // Navigate the same path inside the main component
    let compNode: BaseNode | null = mainComp;
    for (const idx of path) {
      if (!compNode || !('children' in compNode)) { compNode = null; break; }
      const children: readonly SceneNode[] = (compNode as ChildrenMixin).children;
      compNode = idx < children.length ? (children[idx] as BaseNode) : null;
    }
    if (!compNode) continue;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    try {
      const n = targetNode as any;
      const c = compNode as any;
      if (ref.type === 'fill' && 'fills' in compNode && 'fills' in targetNode) {
        await n.setFillStyleIdAsync?.('');
        n.fills = c.fills;
        reset++;
      } else if (ref.type === 'stroke' && 'strokes' in compNode && 'strokes' in targetNode) {
        await n.setStrokeStyleIdAsync?.('');
        n.strokes = c.strokes;
        reset++;
      }
    } catch (e) {
      console.error('[StyleShift] resetOverride:', targetNode.name, e);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  return { reset };
}

export async function executeStyleShift(nodeId: string): Promise<{ converted: number }> {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.type === 'DOCUMENT' || node.type === 'PAGE') return { converted: 0 };

  const refs: StyleRef[] = [];
  await walk(node as SceneNode, refs, null);

  const raw = await refsToRawItems(refs);

  let converted = 0;
  // Dedup: avoid applying twice to the same main-component node (multiple instances)
  const processedCompNodes = new Set<string>();

  for (const item of raw) {
    if (item.componentKind === 'remote' || item.componentKind === 'spark') continue;

    const variable = await findVariable(item.targetName);
    if (!variable) continue;

    /* eslint-disable @typescript-eslint/no-explicit-any */

    if (item.componentKind === 'local') {
      // Apply variable directly in the source component
      const target = await figma.getNodeByIdAsync(item.nodeId);
      if (!target) continue;

      // The target may itself be an instance, or we walk up to find the nearest INSTANCE ancestor
      let instanceNode: InstanceNode | null = null;
      if (target.type === 'INSTANCE') {
        instanceNode = target as InstanceNode;
      } else {
        let cur: BaseNode = target;
        while (cur.parent) {
          cur = cur.parent;
          if (cur.type === 'INSTANCE') { instanceNode = cur as InstanceNode; break; }
        }
      }
      if (!instanceNode) continue;

      const mainComp = await instanceNode.getMainComponentAsync();
      if (!mainComp) continue;

      // Build path from instanceNode → target via .parent
      let pathValid = true;
      const path: number[] = [];
      let pathCur: BaseNode = target;
      while (pathCur.id !== instanceNode.id) {
        const parent = pathCur.parent;
        if (!parent || !('children' in parent)) { pathValid = false; break; }
        const idx = (parent as ChildrenMixin).children.findIndex(c => c.id === pathCur.id);
        if (idx === -1) { pathValid = false; break; }
        path.unshift(idx);
        pathCur = parent;
      }
      if (!pathValid) continue;

      // Navigate same path in main component
      let compNode: BaseNode | null = mainComp;
      for (const idx of path) {
        if (!compNode || !('children' in compNode)) { compNode = null; break; }
        const children: readonly SceneNode[] = (compNode as ChildrenMixin).children;
        compNode = idx < children.length ? (children[idx] as BaseNode) : null;
      }
      if (!compNode) continue;

      const dedupKey = `${compNode.id}:${item.type}`;
      if (processedCompNodes.has(dedupKey)) continue;
      processedCompNodes.add(dedupKey);

      try {
        const n = compNode as any;
        if (item.type === 'fill' && 'fills' in compNode) {
          const fills: Paint[] = Array.isArray(n.fills) ? n.fills : [];
          const newFills = fills.map((p, i) =>
            i === 0 && p.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(p, 'color', variable) : p,
          );
          await n.setFillStyleIdAsync?.('');
          n.fills = newFills;
          converted++;
        } else if (item.type === 'stroke' && 'strokes' in compNode) {
          const strokes: Paint[] = Array.isArray(n.strokes) ? n.strokes : [];
          const newStrokes = strokes.map((p, i) =>
            i === 0 && p.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(p, 'color', variable) : p,
          );
          await n.setStrokeStyleIdAsync?.('');
          n.strokes = newStrokes;
          converted++;
        }
      } catch (e) {
        console.error('[StyleShift] local fix:', compNode.name, e);
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
      continue;
    }

    // componentKind === null: apply directly on the node
    const target = await figma.getNodeByIdAsync(item.nodeId);
    if (!target) continue;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    try {
      const n = target as any;
      if (item.type === 'fill' && 'fillStyleId' in target && 'fills' in target) {
        const fills: ReadonlyArray<Paint> | symbol = n.fills;
        if (!Array.isArray(fills)) continue;
        const newFills = (fills as Paint[]).map((p, i) =>
          i === 0 && p.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(p, 'color', variable) : p,
        );
        await target.setFillStyleIdAsync('');
        n.fills = newFills;
        converted++;
      } else if (item.type === 'stroke' && 'strokeStyleId' in target && 'strokes' in target) {
        const strokes: ReadonlyArray<Paint> = n.strokes;
        if (!Array.isArray(strokes)) continue;
        const newStrokes = (strokes as Paint[]).map((p, i) =>
          i === 0 && p.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(p, 'color', variable) : p,
        );
        await target.setStrokeStyleIdAsync('');
        n.strokes = newStrokes;
        converted++;
      }
    } catch (e) {
      console.error('[StyleShift] node:', item.nodeName, e);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  return { converted };
}

export interface ManualSelection {
  nodeId: string;
  type: 'fill' | 'stroke';
  variableName: string;
  componentKind: ComponentKind | null;
}

export async function applyManualSelections(selections: ManualSelection[]): Promise<{ converted: number }> {
  let converted = 0;

  for (const sel of selections) {
    if (sel.componentKind === 'remote' || sel.componentKind === 'spark') continue;

    const variable = await findVariable(sel.variableName);
    if (!variable) continue;

    const target = await figma.getNodeByIdAsync(sel.nodeId);
    if (!target) continue;

    /* eslint-disable @typescript-eslint/no-explicit-any */

    if (sel.componentKind === 'local') {
      let instanceNode: InstanceNode | null = null;
      if (target.type === 'INSTANCE') {
        instanceNode = target as InstanceNode;
      } else {
        let cur: BaseNode = target;
        while (cur.parent) {
          cur = cur.parent;
          if (cur.type === 'INSTANCE') { instanceNode = cur as InstanceNode; break; }
        }
      }
      if (!instanceNode) continue;

      const mainComp = await instanceNode.getMainComponentAsync();
      if (!mainComp) continue;

      let pathValid = true;
      const path: number[] = [];
      let pathCur: BaseNode = target;
      while (pathCur.id !== instanceNode.id) {
        const parent = pathCur.parent;
        if (!parent || !('children' in parent)) { pathValid = false; break; }
        const idx = (parent as ChildrenMixin).children.findIndex(c => c.id === pathCur.id);
        if (idx === -1) { pathValid = false; break; }
        path.unshift(idx);
        pathCur = parent;
      }
      if (!pathValid) continue;

      let compNode: BaseNode | null = mainComp;
      for (const idx of path) {
        if (!compNode || !('children' in compNode)) { compNode = null; break; }
        const children: readonly SceneNode[] = (compNode as ChildrenMixin).children;
        compNode = idx < children.length ? children[idx] as BaseNode : null;
      }
      if (!compNode) continue;

      try {
        const n = compNode as any;
        if (sel.type === 'fill' && 'fills' in compNode) {
          const fills: Paint[] = Array.isArray(n.fills) ? n.fills : [];
          const newFills = fills.map((p, i) =>
            i === 0 && p.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(p, 'color', variable) : p,
          );
          await n.setFillStyleIdAsync?.('');
          n.fills = newFills;
          converted++;
        } else if (sel.type === 'stroke' && 'strokes' in compNode) {
          const strokes: Paint[] = Array.isArray(n.strokes) ? n.strokes : [];
          const newStrokes = strokes.map((p, i) =>
            i === 0 && p.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(p, 'color', variable) : p,
          );
          await n.setStrokeStyleIdAsync?.('');
          n.strokes = newStrokes;
          converted++;
        }
      } catch (e) {
        console.error('[StyleShift] applyManual local:', e);
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
      continue;
    }

    // componentKind === null: apply directly on the node
    /* eslint-disable @typescript-eslint/no-explicit-any */
    try {
      const n = target as any;
      if (sel.type === 'fill' && 'fillStyleId' in target && 'fills' in target) {
        const fills = Array.isArray(n.fills) ? n.fills as Paint[] : [];
        const newFills = fills.map((p, i) =>
          i === 0 && p.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(p, 'color', variable) : p,
        );
        await target.setFillStyleIdAsync('');
        n.fills = newFills;
        converted++;
      } else if (sel.type === 'stroke' && 'strokeStyleId' in target && 'strokes' in target) {
        const strokes = Array.isArray(n.strokes) ? n.strokes as Paint[] : [];
        const newStrokes = strokes.map((p, i) =>
          i === 0 && p.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(p, 'color', variable) : p,
        );
        await target.setStrokeStyleIdAsync('');
        n.strokes = newStrokes;
        converted++;
      }
    } catch (e) {
      console.error('[StyleShift] applyManual direct:', e);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  return { converted };
}
