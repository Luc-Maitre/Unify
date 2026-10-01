import { useState, useEffect } from 'preact/hooks';
import { TOOLS } from '../tools';
import { AwarenessBanner } from './AwarenessBanner';
import { ToolCard } from './ToolCard';
import { fetchAwareness } from '../awarenessService';
import type { AwarenessContent } from '../awarenessService';

const FILTERS = [
  { label: 'Tout', value: 'all' },
  { label: 'Rebranding', value: 'rebranding' },
  { label: 'Nettoyage', value: 'nettoyage' },
];

interface Props {
  onNavigate: (panelId: string, title: string) => void;
}

const FALLBACK: AwarenessContent = {
  title: 'Titre de la bannière',
  description: 'Description de la bannière à renseigner ici.',
  visible: true,
};

export function HomePanel({ onNavigate }: Props) {
  const [filter, setFilter] = useState('all');
  const [awareness, setAwareness] = useState<AwarenessContent>(FALLBACK);

  useEffect(() => {
    fetchAwareness().then(data => { if (data) setAwareness(data); });

    const handler = (event: MessageEvent) => {
      if (event.data?.pluginMessage?.type === 'plugin-run') {
        fetchAwareness().then(data => { if (data) setAwareness(data); });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const visible = TOOLS.filter(t =>
    filter === 'all' || t.categories.some(c => c.toLowerCase() === filter.toLowerCase())
  );

  const speakerIcon = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M13.7032 2.01189C13.5267 1.98626 13.3465 2.00219 13.1774 2.05837L2.39851 5.74729C2.08828 5.85397 1.8193 6.0526 1.62855 6.31585C1.43781 6.57911 1.33468 6.89404 1.33337 7.21732V8.2097C1.33337 8.21718 1.3335 8.22465 1.33376 8.23212C1.34472 8.54732 1.45231 8.8519 1.64239 9.10587C1.83248 9.35984 2.09625 9.55136 2.39896 9.65526L3.64105 10.0814L3.64104 11.0792L3.64105 11.0818C3.64428 11.884 3.95825 12.6548 4.51902 13.2373C5.07979 13.8198 5.84518 14.1701 6.65931 14.2169C7.47344 14.2636 8.27507 14.0033 8.90095 13.489C9.32123 13.1437 9.64103 12.7012 9.83549 12.2066L13.1712 13.351L13.1774 13.3531C13.3465 13.4093 13.5267 13.4252 13.7032 13.3996C13.8797 13.3739 14.0476 13.3075 14.1929 13.2057C14.3383 13.1038 14.457 12.9696 14.5394 12.8138C14.6217 12.6581 14.6654 12.4854 14.6667 12.3099L14.6667 3.10647L14.6667 3.10161C14.6653 2.92608 14.6217 2.75336 14.5394 2.59764C14.457 2.44191 14.3383 2.30762 14.1929 2.2058C14.0476 2.10398 13.8798 2.03752 13.7032 2.01189ZM8.57532 11.7743L4.97438 10.5388V11.0778C4.97657 11.5458 5.1599 11.9955 5.48711 12.3354C5.8146 12.6756 6.26158 12.8802 6.73704 12.9075C7.21249 12.9348 7.68064 12.7828 8.04615 12.4824C8.27999 12.2903 8.46056 12.0466 8.57532 11.7743ZM13.3334 12.0175V3.39371L2.83811 6.98557C2.78824 7.00281 2.745 7.03479 2.71431 7.07714C2.68372 7.11936 2.6671 7.16981 2.66671 7.22164V8.19501C2.66988 8.24309 2.68699 8.28933 2.71609 8.32821C2.74675 8.36917 2.78929 8.40006 2.83811 8.41682L13.3334 12.0175Z" fill="currentColor"/>
    </svg>
  );

  return (
    <div class="home-panel">
      {awareness.visible && (
        <section class="home-section">
          <p class="home-label">WHAT'S UP ?</p>
          <AwarenessBanner
            title={awareness.title}
            description={awareness.description}
            icon={speakerIcon}
          />
        </section>
      )}

      <section class="home-section">
        <p class="home-label">BOITE À OUTILS</p>
        <div class="chip-row">
          {FILTERS.map(f => (
            <button
              key={f.value}
              class={`chip${filter === f.value ? ' active' : ''}`}
              data-label={f.label}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div class="tool-grid">
          {visible.map(tool => (
            <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
}
