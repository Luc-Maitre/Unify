import lbcOrange from '../assets/LBC-orange.svg';

interface Props {
  onUiKit: () => void;
}

export function Footer({ onUiKit }: Props) {
  return (
    <footer id="footer-home">
      <div class="footer-brand">
        <img src={lbcOrange} width="11" height="12" alt="Leboncoin" aria-hidden="true" />
        <span class="footer-brand-name">Leboncoin plugin</span>
      </div>
      <div class="footer-meta">
        <button class="footer-settings-btn" onClick={onUiKit}>UI Kit</button>
        <span class="footer-version">V.1.1</span>
      </div>
    </footer>
  );
}
