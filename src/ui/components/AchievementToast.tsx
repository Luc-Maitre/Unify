import badgeSwap1x from '../assets/achievements/badge-swap.png';
import badgeSwap2x from '../assets/achievements/badge-swap@2x.png';
import achievementBadge from '../assets/AchievementBadge.svg';
import closeIcon from '../assets/Close.svg';

interface Props {
  label: string;
  subtitle: string;
  onClose: () => void;
}

export function AchievementToast({ label, subtitle, onClose }: Props) {
  return (
    <div class="achievement-toast">
      <div class="achievement-toast__badge">
        <img src={achievementBadge} class="achievement-badge-bg" alt="" aria-hidden="true" />
        <img src={badgeSwap1x} srcSet={`${badgeSwap1x} 1x, ${badgeSwap2x} 2x`} class="achievement-toast__badge-img" width="45" height="50" alt="" />
        <span class="confetti confetti--1" />
        <span class="confetti confetti--2" />
        <span class="confetti confetti--3" />
        <span class="confetti confetti--4" />
        <span class="confetti confetti--5" />
        <span class="confetti confetti--6" />
      </div>
      <div class="achievement-toast__content">
        <span class="achievement-toast__eyebrow">SUCCÈS DÉBLOQUÉ</span>
        <span class="achievement-toast__title">{label}</span>
        <span class="achievement-toast__subtitle">{subtitle}</span>
      </div>
      <button class="achievement-toast__close" onClick={onClose} aria-label="Fermer">
        <img src={closeIcon} width="16" height="16" alt="" />
      </button>
    </div>
  );
}
