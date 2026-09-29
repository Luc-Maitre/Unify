import type { AchievementInfo } from '../types';
import badgeSwap1x from '../assets/achievements/badge-swap.png';
import badgeSwap2x from '../assets/achievements/badge-swap@2x.png';
import achievementBadge from '../assets/AchievementBadge.svg';

const BADGE_MAP: Record<string, { src1x: string; src2x: string }> = {
  'first-swap': { src1x: badgeSwap1x, src2x: badgeSwap2x },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface Props {
  achievements: AchievementInfo[];
}

export function AchievementsPanel({ achievements }: Props) {
  return (
    <div class="tool-panel achievements-panel">
      {achievements.length === 0 ? (
        <div class="achievements-empty">Aucun succès débloqué pour l'instant.</div>
      ) : (
        <ul class="achievements-list">
          {achievements.map(a => {
            const badge = BADGE_MAP[a.id] ?? BADGE_MAP['first-swap'];
            return (
              <li key={a.id} class="achievement-item">
                <div class="achievement-item__badge">
                  <img src={achievementBadge} class="achievement-badge-bg" alt="" aria-hidden="true" />
                  <img
                    src={badge.src1x}
                    srcSet={`${badge.src1x} 1x, ${badge.src2x} 2x`}
                    width="45"
                    height="50"
                    alt=""
                  />
                </div>
                <div class="achievement-item__content">
                  <div class="achievement-item__title-row">
                    <span class="achievement-item__label">{a.label}</span>
                    {a.unlockedAt && (
                      <span class="achievement-item__date">{formatDate(a.unlockedAt)}</span>
                    )}
                  </div>
                  <span class="achievement-item__subtitle">{a.subtitle}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
