import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import type { MigrationMeta, InstanceInfo, ActionBarConfig } from '../types';
import { SelectionCard } from './SelectionCard';
import { CheckboxCard } from './CheckboxCard';
import { Stepper } from './Stepper';
import { Tag } from './Tag';
import { Checkbox } from './Checkbox';
import { Badge } from './Badge';
import fileIcon from '../assets/File.svg?raw';
import cursorIcon from '../assets/Cursor.svg?raw';
import circleCheckIcon from '../assets/CircleCheck.svg';
import { PreviewPair } from './PreviewPair';

interface Props {
  onActionBar: (config: ActionBarConfig) => void;
  onToast: (title: string, variant: 'success' | 'error' | 'warning') => void;
  onHome: () => void;
}

type Step = 'configure' | 'results' | 'success';

export function TransitionPanel({ onActionBar, onToast, onHome }: Props) {
  const [step, setStep] = useState<Step>('configure');
  const [migrations, setMigrations] = useState<MigrationMeta[]>([]);
  const [currentMigrationId, setCurrentMigrationId] = useState<string | null>(null);
  const [scope, setScope] = useState<'document' | 'selection'>('document');
  const [instances, setInstances] = useState<InstanceInfo[]>([]);
  const [selected, setSelected] = useState(new Set<string>());
  const [scanning, setScanning] = useState(false);
  const [targetFound, setTargetFound] = useState(true);
  const [expandedInstanceId, setExpandedInstanceId] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [swappedCount, setSwappedCount] = useState(0);

  const beforeCache = useRef(new Map<string, string | null>());
  const afterCache = useRef(new Map<string, string | null>());

  const stateRef = useRef({ currentMigrationId, scope, instances, selected, step });
  stateRef.current = { currentMigrationId, scope, instances, selected, step };

  const handleExecute = useCallback(() => {
    const { currentMigrationId: mid, selected: sel } = stateRef.current;
    if (!mid || sel.size === 0) return;
    pushResultsBar(sel.size, true);
    parent.postMessage({
      pluginMessage: { type: 'execute-swaps', migrationId: mid, instanceIds: [...sel] },
    }, '*');
  }, []);

  const handleAnalyse = useCallback(() => {
    const { currentMigrationId: mid, scope: s } = stateRef.current;
    if (!mid) return;
    setScanning(true);
    parent.postMessage({ pluginMessage: { type: 'scan', migrationId: mid, scope: s } }, '*');
  }, []);

  const handleCancel = useCallback(() => {
    setStep('configure');
    const mid = stateRef.current.currentMigrationId;
    onActionBar({
      label: 'Analyser',
      disabled: !mid,
      loading: false,
      onClick: handleAnalyse,
    });
  }, [onActionBar, handleAnalyse]);

  const handleFinish = useCallback(() => {
    onHome();
  }, [onHome]);

  const pushResultsBar = useCallback((count: number, loading = false) => {
    onActionBar({
      label: loading ? 'Application…' : count > 0 ? `Appliquer (${count})` : 'Appliquer',
      disabled: count === 0,
      loading,
      onClick: handleExecute,
      secondaryLabel: 'Annuler',
      onSecondary: handleCancel,
    });
  }, [onActionBar, handleExecute, handleCancel]);

  const pushConfigureBar = useCallback((migrationId: string | null, loading = false) => {
    onActionBar({
      label: loading ? 'Analyse en cours…' : 'Analyser',
      disabled: !migrationId || loading,
      loading,
      onClick: handleAnalyse,
    });
  }, [onActionBar, handleAnalyse]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data?.pluginMessage;
      if (!msg) return;

      if (msg.type === 'migrations') {
        setMigrations(msg.migrations as MigrationMeta[]);
      }

      if (msg.type === 'scan-result') {
        setScanning(false);
        const list = (msg.instances ?? []) as InstanceInfo[];
        const tf = msg.targetFound !== false;
        setInstances(list);
        setTargetFound(tf);
        const sel = new Set(list.map((i: InstanceInfo) => i.id));
        setSelected(sel);
        beforeCache.current.clear();
        afterCache.current.clear();
        setExpandedInstanceId(null);
        setStep('results');
        pushResultsBar(tf ? sel.size : 0);
      }

      if (msg.type === 'swap-done') {
        const { swapped, failed } = msg;
        if (failed === 0 && swapped > 0) {
          setSwappedCount(swapped);
          setStep('success');
          onActionBar({
            label: 'Terminer',
            disabled: false,
            loading: false,
            onClick: handleFinish,
            secondaryLabel: 'Recommencer',
            onSecondary: handleCancel,
          });
        } else {
          const text = failed > 0
            ? `${swapped} swap${swapped > 1 ? 's' : ''} OK · ${failed} échec${failed > 1 ? 's' : ''}`
            : `Aucun swap effectué`;
          onToast(text, failed > 0 ? 'error' : 'warning');
          if (swapped > 0) {
            const { currentMigrationId: mid, scope: s } = stateRef.current;
            if (mid) {
              setScanning(true);
              pushResultsBar(0, true);
              parent.postMessage({ pluginMessage: { type: 'scan', migrationId: mid, scope: s } }, '*');
            }
          } else {
            pushResultsBar(stateRef.current.selected.size);
          }
        }
      }

      if (msg.type === 'preview-result') {
        const { nodeId, beforeBytes, afterBytes } = msg;
        const toUrl = (bytes: number[] | null): string | null => {
          if (!bytes) return null;
          return URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
        };
        beforeCache.current.set(nodeId, toUrl(beforeBytes));
        afterCache.current.set(nodeId, toUrl(afterBytes));
        setPreviewVersion(v => v + 1);
      }

      if (msg.type === 'error') {
        setScanning(false);
        onToast(msg.message, 'error');
        const { currentMigrationId: mid, step: s } = stateRef.current;
        if (s === 'results') {
          pushResultsBar(stateRef.current.selected.size);
        } else {
          pushConfigureBar(mid);
        }
      }
    }

    window.addEventListener('message', handleMessage);
    parent.postMessage({ pluginMessage: { type: 'get-migrations' } }, '*');
    pushConfigureBar(null);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function handleMigrationToggle(id: string, checked: boolean) {
    const newId = checked ? id : null;
    setCurrentMigrationId(newId);
    pushConfigureBar(newId);
  }

  function toggleInstance(id: string, checked: boolean) {
    const next = new Set(selected);
    checked ? next.add(id) : next.delete(id);
    setSelected(next);
    pushResultsBar(next.size);
  }

  function toggleAll(checked: boolean) {
    const next = checked ? new Set(instances.map(i => i.id)) : new Set<string>();
    setSelected(next);
    pushResultsBar(next.size);
  }

  function toggleExpand(inst: InstanceInfo) {
    const newId = expandedInstanceId === inst.id ? null : inst.id;
    setExpandedInstanceId(newId);
    if (newId && !beforeCache.current.has(inst.id)) {
      parent.postMessage({
        pluginMessage: {
          type: 'preview-request',
          nodeId: inst.id,
          targetComponentKey: inst.targetComponentKey,
          mappedProperties: inst.mappedProperties,
        },
      }, '*');
    }
  }

  // ── Step 3 : success ─────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <div class="success-panel">
        <img class="success-icon" src={circleCheckIcon} width="120" height="120" alt="" />
        <h2 class="success-title">{swappedCount} instance{swappedCount > 1 ? 's' : ''} migrée{swappedCount > 1 ? 's' : ''}</h2>
        <p class="success-desc">Le plan s'est passé sans encombres</p>
      </div>
    );
  }

  // ── Step 1 : configure ────────────────────────────────────────────────────

  if (step === 'configure') {
    return (
      <div class="configure-panel">
        <div class="flow-step">
          <div class="flow-step-header">
            <Stepper value={1} />
            <p class="flow-step-label">Choisis ce que tu veux migrer</p>
          </div>
          <div class="migration-card-list">
            {migrations.length === 0 ? (
              <div style={{ color: 'var(--color-neutral)', fontSize: '11px' }}>Chargement…</div>
            ) : migrations.map(m => (
              <CheckboxCard
                key={m.id}
                label={m.label}
                checked={currentMigrationId === m.id}
                disabled={m.disabled}
                onChange={checked => handleMigrationToggle(m.id, checked)}
                slot={m.disabled ? <Tag variant="tertiary">BIENTÔT</Tag> : undefined}
              />
            ))}
          </div>
        </div>

        <div class="flow-step">
          <div class="flow-step-header">
            <Stepper value={2} />
            <p class="flow-step-label">Choisis le périmètre de la migration</p>
          </div>
          <div class="scope-row">
            <SelectionCard
              title="Tout le document"
              icon={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: fileIcon }} />}
              selected={scope === 'document'}
              onClick={() => setScope('document')}
            />
            <SelectionCard
              title="Sélection"
              icon={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: cursorIcon }} />}
              selected={scope === 'selection'}
              onClick={() => setScope('selection')}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2 : results ──────────────────────────────────────────────────────

  const allSelected = instances.length > 0 && selected.size === instances.length;

  return (
    <div class="results-panel">
      {!targetFound && (
        <div class="warning">
          ⚠️ Composant cible introuvable dans le document — vérifiez la config.
        </div>
      )}

      <div class="results-header">
        <div class="results-header__left">
          <h2 class="results-title">Corrige les instances trouvées</h2>
          <Badge value={instances.length} />
        </div>
        <label class="select-all-row">
          <Checkbox checked={allSelected} onChange={toggleAll} />
          Tout sélectionner
        </label>
      </div>

      {scanning ? (
        <div class="scanning-state">
          <span class="spinner" />
          <span>Analyse en cours…</span>
        </div>
      ) : instances.length === 0 ? (
        <div class="empty-state">Aucune instance trouvée.</div>
      ) : (
        <div class="results-list">
          {instances.map(inst => {
            const isExpanded = expandedInstanceId === inst.id;
            const isChecked = selected.has(inst.id);
            void previewVersion; // ensure re-render when cache updates
            const beforeUrl = beforeCache.current.has(inst.id) ? beforeCache.current.get(inst.id) : undefined;
            const afterUrl = afterCache.current.has(inst.id) ? afterCache.current.get(inst.id) : undefined;

            return (
              <div
                key={inst.id}
                class={`result-item${isChecked ? ' result-item--checked' : ''}`}
                onClick={() => toggleExpand(inst)}
              >
                <div class="result-item__row">
                  <span onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={isChecked}
                      onChange={checked => toggleInstance(inst.id, checked)}
                    />
                  </span>
                  <div class="result-item__info">
                    <div class="result-item__name">{inst.name}</div>
                    <div
                    class="result-item__location result-item__location--link"
                    onClick={e => { e.stopPropagation(); parent.postMessage({ pluginMessage: { type: 'focus-node', nodeId: inst.id } }, '*'); }}
                  >{inst.pageName} · {inst.parentName}</div>
                  </div>
                  {Object.entries(inst.properties).map(([k, v]) => (
                    <Tag key={k} variant="default">{`${k}: ${v}`}</Tag>
                  ))}
                  <span class="result-item__toggle" aria-hidden>
                    {isExpanded ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    )}
                  </span>
                </div>

                {isExpanded && (
                  <div class="result-preview">
                    <PreviewPair beforeUrl={beforeUrl} afterUrl={afterUrl} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
