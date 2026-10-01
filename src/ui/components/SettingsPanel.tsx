import { useState } from 'preact/hooks';
import sunMoonIcon from '../assets/SunMoon.svg?raw';
import sunIcon from '../assets/Sun.svg?raw';
import moonStarIcon from '../assets/MoonStar.svg?raw';
import type { Theme } from '../types';
import { SelectionCard } from './SelectionCard';
import { Button } from './Button';

interface Props {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

const THEME_OPTIONS: { id: Theme; label: string; icon: string }[] = [
  { id: 'auto',  label: 'Automatique', icon: sunMoonIcon },
  { id: 'light', label: 'Clair',        icon: sunIcon },
  { id: 'dark',  label: 'Sombre',       icon: moonStarIcon },
];

export function SettingsPanel({ theme, onThemeChange }: Props) {
  const [resetDone, setResetDone] = useState(false);

  function resetStorage() {
    parent.postMessage({ pluginMessage: { type: 'reset-storage' } }, '*');
    onThemeChange('auto');
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  }

  return (
    <div class="tool-panel settings-panel">
      <div class="settings-section">
        <span class="settings-section__label">Thème</span>
        <div class="scope-row">
          {THEME_OPTIONS.map(opt => (
            <SelectionCard
              key={opt.id}
              title={opt.label}
              icon={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: opt.icon }} />}
              selected={theme === opt.id}
              onClick={() => onThemeChange(opt.id)}
            />
          ))}
        </div>
      </div>
      <div class="settings-section">
        <span class="settings-section__label">Zone dangereuse</span>
        <div style={{ alignSelf: 'flex-start' }}>
          <Button appearance="error" onClick={resetStorage}>
            {resetDone ? '✓ Mémoire réinitialisée' : 'Reset de la mémoire du plugin'}
          </Button>
        </div>
      </div>
    </div>
  );
}
