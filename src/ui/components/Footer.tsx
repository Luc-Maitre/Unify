import lbcOrange from '../assets/LBC-orange.svg';

interface Props {
  onUiKit: () => void;
  onAchievements?: () => void;
  hasAchievements?: boolean;
  onSettings: () => void;
}

export function Footer({ onAchievements, hasAchievements, onSettings }: Props) {
  return (
    <footer id="footer-home">
      <div class="footer-brand">
        <img src={lbcOrange} width="11" height="12" alt="Leboncoin" aria-hidden="true" />
        <span class="footer-brand-name">Leboncoin plugin</span>
      </div>
      <div class="footer-meta">
        {hasAchievements && (
          <button class="footer-settings-btn" onClick={onAchievements}>Mes succès</button>
        )}
        <button class="footer-settings-btn" onClick={onSettings}>Paramètres</button>
        <span class="footer-version">V.{__APP_VERSION__}</span>
      </div>
    </footer>
  );
}
