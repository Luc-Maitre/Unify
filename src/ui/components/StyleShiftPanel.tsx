import { useState, useEffect, useRef, useCallback, useMemo } from 'preact/hooks';
import type { StyleItem, ActionBarConfig } from '../types';
import { Tag } from './Tag';

function VarAutocomplete({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() =>
    query.trim()
      ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
      : options,
    [options, query],
  );

  const handleSelect = (opt: string) => {
    onChange(opt);
    setQuery(opt);
    setOpen(false);
  };

  const handleBlur = () => {
    // Delay to allow mousedown on list items to fire first
    setTimeout(() => {
      setOpen(false);
      // If query doesn't match the selected value, reset to selected
      if (query !== value) setQuery(value);
    }, 150);
  };

  return (
    <div class="var-autocomplete">
      <input
        class="var-autocomplete-input"
        type="text"
        value={query}
        placeholder="Rechercher une variable…"
        onInput={e => { setQuery((e.target as HTMLInputElement).value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
      />
      {open && filtered.length > 0 && (
        <ul class="var-autocomplete-list">
          {filtered.slice(0, 40).map(opt => (
            <li
              key={opt}
              class={`var-autocomplete-item${opt === value ? ' selected' : ''}`}
              onMouseDown={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Props {
  onActionBar: (config: ActionBarConfig) => void;
  onToast: (title: string, variant: 'success' | 'error' | 'warning') => void;
}

type State = 'no-selection' | 'scanning' | 'ready';
type FilterKey = 'all' | 'frame' | 'local' | 'remote' | 'spark' | 'no-match';

const FILTERS: { key: Exclude<FilterKey, 'all'>; label: string }[] = [
  { key: 'frame', label: 'Frames' },
  { key: 'local', label: 'Composants locaux' },
  { key: 'remote', label: 'Composants distants' },
  { key: 'spark', label: 'Composants Spark' },
  { key: 'no-match', label: 'Sans correspondance' },
];

export function StyleShiftPanel({ onActionBar, onToast }: Props) {
  const [uiState, setUiState] = useState<State>('scanning');
  const [items, setItems] = useState<StyleItem[]>([]);
  const [executing, setExecuting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [sparkVarNames, setSparkVarNames] = useState<string[]>([]);
  // key: `${nodeId}:${type}`, value: chosen variable name
  const [manualSelections, setManualSelections] = useState<Record<string, string>>({});

  const stateRef = useRef({ executing });
  stateRef.current = { executing };

  const handleFix = useCallback(() => {
    if (stateRef.current.executing) return;
    setExecuting(true);
    parent.postMessage({ pluginMessage: { type: 'style-shift-execute' } }, '*');
  }, []);

  const handleReset = useCallback(() => {
    if (stateRef.current.executing) return;
    setExecuting(true);
    parent.postMessage({ pluginMessage: { type: 'style-shift-reset-instances' } }, '*');
  }, []);

  const handleManualFix = useCallback((currentSelections: Record<string, string>, currentItems: StyleItem[]) => {
    if (stateRef.current.executing) return;
    const selections = Object.entries(currentSelections)
      .map(([key, variableName]) => {
        const pipeIdx = key.lastIndexOf('|');
      const nodeId = key.substring(0, pipeIdx);
      const type = key.substring(pipeIdx + 1) as 'fill' | 'stroke';
        const item = currentItems.find(i => i.nodeId === nodeId && i.type === type);
        if (!item) return null;
        return { nodeId, type, variableName, componentKind: item.componentKind };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
    if (!selections.length) return;
    setExecuting(true);
    parent.postMessage({ pluginMessage: { type: 'style-shift-apply-manual', selections } }, '*');
  }, []);

  const pushActionBar = useCallback((state: State, scanItems: StyleItem[], isExecuting: boolean, currentManualSelections?: Record<string, string>) => {
    const ready = state === 'ready' && !isExecuting;

    if (activeFilter === 'spark') {
      const sparkCount = scanItems.filter(i => i.componentKind === 'spark').length;
      onActionBar({
        label: isExecuting ? 'Application…' : 'Réinitialiser',
        disabled: !ready || sparkCount === 0,
        loading: isExecuting,
        onClick: handleReset,
      });
      return;
    }

    if (activeFilter === 'remote') {
      onActionBar({ label: 'Corriger', disabled: true, loading: false, onClick: handleFix });
      return;
    }

    if (activeFilter === 'no-match') {
      const selCount = Object.keys(currentManualSelections ?? {}).length;
      onActionBar({
        label: isExecuting ? 'Application…' : 'Corriger',
        disabled: !ready || selCount === 0,
        loading: isExecuting,
        onClick: () => handleManualFix(currentManualSelections ?? {}, scanItems),
      });
      return;
    }

    // frame, local, all → Corriger
    const matchCount = scanItems.filter(i => i.hasMatch && (i.componentKind === null || i.componentKind === 'local')).length;
    onActionBar({
      label: isExecuting ? 'Application…' : 'Corriger',
      disabled: !ready || matchCount === 0,
      loading: isExecuting,
      onClick: handleFix,
    });
  }, [onActionBar, handleFix, handleReset, handleManualFix, activeFilter]);

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: 'style-shift-scan' } }, '*');

    function handleMessage(event: MessageEvent) {
      const msg = event.data?.pluginMessage;
      if (!msg) return;

      if (msg.type === 'style-shift-selection') {
        const count = msg.count as number;
        if (count !== 1) {
          setUiState('no-selection');
          setItems([]);
          setExecuting(false);
          setManualSelections({});
          pushActionBar('no-selection', [], false, {});
        } else {
          setUiState('scanning');
          parent.postMessage({ pluginMessage: { type: 'style-shift-scan' } }, '*');
        }
      }

      if (msg.type === 'style-shift-scan-result') {
        const newItems = (msg.items ?? []) as StyleItem[];
        const newVarNames = (msg.sparkVarNames ?? []) as string[];
        setItems(newItems);
        setSparkVarNames(newVarNames);
        setManualSelections({});
        setUiState('ready');
        setExecuting(false);
        pushActionBar('ready', newItems, false, {});
      }

      if (msg.type === 'style-shift-reset-result') {
        const reset = msg.reset as number;
        if (reset === 0) {
          onToast('Aucun override à réinitialiser', 'warning');
        } else {
          onToast(`✓ ${reset} override${reset > 1 ? 's' : ''} réinitialisé${reset > 1 ? 's' : ''}`, 'success');
        }
      }

      if (msg.type === 'style-shift-execute-result') {
        const converted = msg.converted as number;
        if (converted === 0) {
          onToast('Aucun style à convertir', 'warning');
        } else {
          onToast(`✓ ${converted} style${converted > 1 ? 's' : ''} converti${converted > 1 ? 's' : ''} en variable`, 'success');
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pushActionBar, onToast]);

  useEffect(() => {
    pushActionBar(uiState, items, executing, manualSelections);
  }, [uiState, items, executing, manualSelections, pushActionBar]);

  const filterCounts = useMemo(() => ({
    all: items.length,
    frame: items.filter(i => i.componentKind === null).length,
    local: items.filter(i => i.componentKind === 'local').length,
    remote: items.filter(i => i.componentKind === 'remote').length,
    spark: items.filter(i => i.componentKind === 'spark').length,
    'no-match': items.filter(i => !i.hasMatch).length,
  }), [items]);

  // Auto-select the first non-empty filter, or fallback to 'all'
  useEffect(() => {
    const first = FILTERS.find(f => filterCounts[f.key] > 0);
    if (!first) { setActiveFilter('all'); return; }
    if (activeFilter === 'all' || filterCounts[activeFilter as Exclude<FilterKey, 'all'>] === 0) {
      setActiveFilter(first.key);
    }
  }, [filterCounts]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredItems = useMemo(() => {
    if (activeFilter === 'frame') return items.filter(i => i.componentKind === null);
    if (activeFilter === 'local') return items.filter(i => i.componentKind === 'local');
    if (activeFilter === 'remote') return items.filter(i => i.componentKind === 'remote');
    if (activeFilter === 'spark') return items.filter(i => i.componentKind === 'spark');
    if (activeFilter === 'no-match') return items.filter(i => !i.hasMatch);
    return items;
  }, [items, activeFilter]);

  if (uiState === 'no-selection') {
    return (
      <div class="style-shift-panel">
        <div class="empty-state">Sélectionne un seul calque pour analyser ses styles.</div>
      </div>
    );
  }

  if (uiState === 'scanning') {
    return (
      <div class="style-shift-panel">
        <div class="empty-state">Analyse en cours…</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div class="style-shift-panel">
        <div class="empty-state">Aucun style à convertir.</div>
      </div>
    );
  }

  return (
    <div class="style-shift-panel">
      <div class="style-shift-header">
        <p class="home-label">STYLES À CONVERTIR</p>
        <div class="chip-row">
          {FILTERS.filter(f => filterCounts[f.key] > 0).map(f => (
            <button
              key={f.key}
              class={`chip${activeFilter === f.key ? ' active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              <span class="chip-inner">
                {f.label}
                <span class="chip-badge">{filterCounts[f.key]}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {activeFilter === 'local' && filteredItems.length > 0 && (
        <p class="style-shift-note">Le style sera remplacé directement dans le composant source.</p>
      )}
      {activeFilter === 'remote' && filteredItems.length > 0 && (
        <p class="style-shift-note">Ces styles sont dans des composants d'une librairie externe. Corrige-les dans la librairie d'origine, publie les changements, puis mets à jour la librairie dans ce fichier.</p>
      )}
      {activeFilter === 'spark' && filteredItems.length > 0 && (
        <p class="style-shift-note">Mettez à jour la librairie Spark avant de réinitialiser.</p>
      )}
      <div class="style-shift-list">
        {filteredItems.length === 0 ? (
          <div class="empty-state">Aucun élément pour ce filtre.</div>
        ) : (
          filteredItems.map((item, i) => (
            <div key={i} class={`style-shift-item${item.hasMatch ? '' : ' style-shift-item--no-match'}`}>
              <div class="style-shift-item-body">
                <div class="style-shift-item-left">
                  <span class="style-shift-style-name">{item.styleName}</span>
                  <span class="style-shift-item-meta">
                    <span class="style-shift-node-name">{item.nodeName}</span>
                    <span class="style-shift-type">{item.type.toUpperCase()}</span>
                  </span>
                </div>
                {item.hasMatch && (
                  <Tag>{item.targetName}</Tag>
                )}
                {!item.hasMatch && activeFilter === 'no-match' && sparkVarNames.length > 0
                  && (item.componentKind === null || item.componentKind === 'local') && (
                  <VarAutocomplete
                    options={sparkVarNames}
                    value={manualSelections[`${item.nodeId}|${item.type}`] ?? ''}
                    onChange={val => setManualSelections(prev => {
                      const next = { ...prev };
                      if (val) next[`${item.nodeId}|${item.type}`] = val;
                      else delete next[`${item.nodeId}|${item.type}`];
                      return next;
                    })}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
