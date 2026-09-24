import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import type { MigrationMeta, InstanceInfo, ActionBarConfig } from '../types';

interface Props {
  onActionBar: (config: ActionBarConfig) => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

interface PreviewDisplay {
  nodeId: string | null;
  beforeUrl: string | null | undefined; // undefined = loading
  afterUrl: string | null | undefined;
}

export function TransitionPanel({ onActionBar, onToast }: Props) {
  const [migrations, setMigrations] = useState<MigrationMeta[]>([]);
  const [currentMigrationId, setCurrentMigrationId] = useState<string | null>(null);
  const [scope, setScope] = useState<'document' | 'selection'>('document');
  const [instances, setInstances] = useState<InstanceInfo[]>([]);
  const [selected, setSelected] = useState(new Set<string>());
  const [scanning, setScanning] = useState(false);
  const [targetFound, setTargetFound] = useState(true);
  const [hasScanResult, setHasScanResult] = useState(false);
  const [preview, setPreview] = useState<PreviewDisplay>({ nodeId: null, beforeUrl: undefined, afterUrl: undefined });

  const beforeCache = useRef(new Map<string, string | null>());
  const afterCache = useRef(new Map<string, string | null>());
  const hoverDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPreviewId = useRef<string | null>(null);

  // Stable ref to avoid stale closures in async callbacks
  const stateRef = useRef({ currentMigrationId, scope, instances, selected });
  stateRef.current = { currentMigrationId, scope, instances, selected };

  const handleExecute = useCallback(() => {
    const { currentMigrationId: mid, selected: sel } = stateRef.current;
    if (!mid || sel.size === 0) return;
    pushActionBar(sel.size, true);
    parent.postMessage({
      pluginMessage: { type: 'execute-swaps', migrationId: mid, instanceIds: [...sel] },
    }, '*');
  }, []);

  const pushActionBar = useCallback((count: number, loading = false) => {
    onActionBar({
      label: loading
        ? 'Application…'
        : count > 0
        ? `Appliquer (${count} swap${count > 1 ? 's' : ''})`
        : 'Appliquer',
      disabled: count === 0,
      loading,
      onClick: handleExecute,
    });
  }, [onActionBar, handleExecute]);

  // Plugin message listener
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data?.pluginMessage;
      if (!msg) return;

      if (msg.type === 'migrations') {
        const list = msg.migrations as MigrationMeta[];
        setMigrations(list);
        const first = list.find((m: MigrationMeta) => !m.disabled);
        if (first) setCurrentMigrationId(first.id);
      }

      if (msg.type === 'scan-result') {
        setScanning(false);
        const list = (msg.instances ?? []) as InstanceInfo[];
        const tf = msg.targetFound !== false;
        setInstances(list);
        setTargetFound(tf);
        setHasScanResult(true);
        const sel = new Set(list.map((i: InstanceInfo) => i.id));
        setSelected(sel);
        beforeCache.current.clear();
        afterCache.current.clear();
        setPreview({ nodeId: null, beforeUrl: undefined, afterUrl: undefined });
        pushActionBar(tf ? sel.size : 0);
      }

      if (msg.type === 'swap-done') {
        const { swapped, failed } = msg;
        const text = failed > 0
          ? `${swapped} swap${swapped > 1 ? 's' : ''} OK · ${failed} échec${failed > 1 ? 's' : ''}`
          : `${swapped} swap${swapped > 1 ? 's' : ''} effectué${swapped > 1 ? 's' : ''} ✓`;
        onToast(text, failed > 0 ? 'error' : 'success');
        if (swapped > 0) {
          const { currentMigrationId: mid, scope: s } = stateRef.current;
          if (mid) {
            setScanning(true);
            setHasScanResult(false);
            pushActionBar(0);
            parent.postMessage({ pluginMessage: { type: 'scan', migrationId: mid, scope: s } }, '*');
          }
        } else {
          pushActionBar(stateRef.current.selected.size);
        }
      }

      if (msg.type === 'preview-result') {
        const { nodeId, beforeBytes, afterBytes } = msg;
        const toUrl = (bytes: number[] | null): string | null => {
          if (!bytes) return null;
          return URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
        };
        const beforeUrl = toUrl(beforeBytes);
        const afterUrl = toUrl(afterBytes);
        beforeCache.current.set(nodeId, beforeUrl);
        afterCache.current.set(nodeId, afterUrl);
        if (pendingPreviewId.current === nodeId) {
          setPreview({ nodeId, beforeUrl, afterUrl });
        }
      }

      if (msg.type === 'error') {
        setScanning(false);
        onToast(msg.message, 'error');
        pushActionBar(stateRef.current.selected.size);
      }
    }

    window.addEventListener('message', handleMessage);
    parent.postMessage({ pluginMessage: { type: 'get-migrations' } }, '*');
    pushActionBar(0);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function handleScan() {
    if (!currentMigrationId) return;
    setScanning(true);
    setHasScanResult(false);
    setInstances([]);
    setSelected(new Set());
    pushActionBar(0);
    parent.postMessage({ pluginMessage: { type: 'scan', migrationId: currentMigrationId, scope } }, '*');
  }

  function toggleInstance(id: string, checked: boolean) {
    const next = new Set(selected);
    checked ? next.add(id) : next.delete(id);
    setSelected(next);
    pushActionBar(next.size);
  }

  function toggleAll(checked: boolean) {
    const next = checked ? new Set(instances.map(i => i.id)) : new Set<string>();
    setSelected(next);
    pushActionBar(next.size);
  }

  function showPreview(inst: InstanceInfo) {
    if (hoverDebounce.current) clearTimeout(hoverDebounce.current);
    hoverDebounce.current = setTimeout(() => {
      pendingPreviewId.current = inst.id;
      const cachedBefore = beforeCache.current.has(inst.id) ? beforeCache.current.get(inst.id) : undefined;
      const cachedAfter = afterCache.current.has(inst.id) ? afterCache.current.get(inst.id) : undefined;
      setPreview({ nodeId: inst.id, beforeUrl: cachedBefore, afterUrl: cachedAfter });
      if (cachedBefore === undefined || cachedAfter === undefined) {
        parent.postMessage({
          pluginMessage: {
            type: 'preview-request',
            nodeId: inst.id,
            targetComponentKey: inst.targetComponentKey,
            mappedProperties: inst.mappedProperties,
          },
        }, '*');
      }
    }, 120);
  }

  function hidePreview() {
    if (hoverDebounce.current) clearTimeout(hoverDebounce.current);
    pendingPreviewId.current = null;
    setPreview({ nodeId: null, beforeUrl: undefined, afterUrl: undefined });
  }

  const allSelected = instances.length > 0 && selected.size === instances.length;

  return (
    <div class="tool-panel">
      <div>
        <div class="section-label">Migration</div>
        <div class="migration-list">
          {migrations.length === 0 ? (
            <div style={{ color: 'var(--color-neutral)', fontSize: '11px' }}>Chargement…</div>
          ) : migrations.map(m => (
            <label
              key={m.id}
              class={`migration-item${m.disabled ? ' disabled' : ''}${currentMigrationId === m.id ? ' active' : ''}`}
            >
              <input
                type="radio"
                name="migration"
                value={m.id}
                checked={currentMigrationId === m.id}
                disabled={m.disabled}
                onChange={() => {
                  setCurrentMigrationId(m.id);
                  setHasScanResult(false);
                  setInstances([]);
                  setSelected(new Set());
                  pushActionBar(0);
                }}
              />
              <span class="migration-label">{m.label}</span>
              {m.disabled && <span class="soon-badge">Bientôt</span>}
            </label>
          ))}
        </div>
      </div>

      <div class="divider" />

      <div>
        <div class="section-label">Périmètre</div>
        <div class="scope-row">
          <button class={`scope-btn${scope === 'document' ? ' active' : ''}`} onClick={() => setScope('document')}>
            Tout le document
          </button>
          <button class={`scope-btn${scope === 'selection' ? ' active' : ''}`} onClick={() => setScope('selection')}>
            Sélection
          </button>
        </div>
      </div>

      <button class="btn-primary" onClick={handleScan} disabled={scanning || !currentMigrationId}>
        {scanning ? <><span class="spinner" /> Analyse en cours…</> : 'Analyser'}
      </button>

      {hasScanResult && (
        <div>
          {!targetFound && (
            <div class="warning">
              ⚠️ Composant cible introuvable dans le document — vérifiez la config.
            </div>
          )}
          <div class="report-header" style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-neutral)', fontSize: '11px' }}>Instances trouvées</span>
              <span class="badge">{instances.length}</span>
            </div>
            <label class="select-all-row">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={e => toggleAll((e.target as HTMLInputElement).checked)}
              />
              Tout sélectionner
            </label>
          </div>

          <div style={{ marginTop: '10px' }}>
            {instances.length === 0 ? (
              <div class="empty-state">Aucune instance trouvée.</div>
            ) : (
              <div class="instance-list" onMouseLeave={hidePreview}>
                {instances.map(inst => (
                  <label key={inst.id} class="instance-item" onMouseEnter={() => showPreview(inst)}>
                    <input
                      type="checkbox"
                      class="inst-checkbox"
                      checked={selected.has(inst.id)}
                      onClick={e => e.stopPropagation()}
                      onChange={e => toggleInstance(inst.id, (e.target as HTMLInputElement).checked)}
                    />
                    <div class="instance-info">
                      <div class="instance-name">{inst.name}</div>
                      <div class="instance-meta">{inst.pageName} · {inst.parentName}</div>
                    </div>
                    {Object.keys(inst.properties ?? {}).length > 0 && (
                      <div class="prop-tags">
                        {Object.entries(inst.properties).map(([k, v]) => (
                          <span key={k} class="prop-tag">{k}: {v}</span>
                        ))}
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div class="instance-preview">
            {preview.nodeId ? (
              <div class="preview-cols">
                <div class="preview-col">
                  <div class="preview-col-label">Avant</div>
                  <div class="preview-col-img-wrap">
                    {preview.beforeUrl === undefined && <span class="preview-spinner" />}
                    {preview.beforeUrl && <img src={preview.beforeUrl} alt="" />}
                  </div>
                </div>
                <div class="preview-sep" />
                <div class="preview-col">
                  <div class="preview-col-label">Après</div>
                  <div class="preview-col-img-wrap">
                    {preview.afterUrl === undefined && <span class="preview-spinner" />}
                    {preview.afterUrl && <img src={preview.afterUrl} alt="" />}
                  </div>
                </div>
              </div>
            ) : (
              <div class="preview-empty">Survolez une instance pour la prévisualiser</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
