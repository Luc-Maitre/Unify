import { useState, useEffect } from 'preact/hooks';
import { TOOLS } from '../tools';
import { AwarenessBanner } from './AwarenessBanner';
import { ToolCard } from './ToolCard';
import { fetchAwareness } from '../awarenessService';
import type { AwarenessContent } from '../awarenessService';

const FILTERS = [
  { label: 'Tout', value: 'all' },
  { label: 'Rebranding', value: 'rebranding' },
  { label: 'Quotidien', value: 'quotidien' },
  { label: 'Review', value: 'review' },
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
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M5 13H10L20 7V25L10 19H5V13Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M10 19V26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M23 11C25.2 12.4 27 14.5 27 17C27 19.5 25.2 21.6 23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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
