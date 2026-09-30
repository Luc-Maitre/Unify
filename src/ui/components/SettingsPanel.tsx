import sunMoonIcon from '../assets/SunMoon.svg';
import sunIcon from '../assets/Sun.svg';
import moonStarIcon from '../assets/MoonStar.svg';
import type { Theme } from '../types';
import { SelectionCard } from './SelectionCard';

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
  return (
    <div class="tool-panel settings-panel">
      <div class="settings-section">
        <span class="settings-section__label">Thème</span>
        <div class="scope-row">
          {THEME_OPTIONS.map(opt => (
            <SelectionCard
              key={opt.id}
              title={opt.label}
              icon={<img src={opt.icon} width="16" height="16" alt="" />}
              selected={theme === opt.id}
              onClick={() => onThemeChange(opt.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
