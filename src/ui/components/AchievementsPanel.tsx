import type { AchievementInfo } from '../types';
import { getBadgeConfig } from '../badgeConfig';

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
            const badge = getBadgeConfig(a.id);
            return (
              <li key={a.id} class="achievement-item">
                <div class="achievement-item__badge">
                  <img
                    src={badge.src1x}
                    srcSet={`${badge.src1x} 1x, ${badge.src2x} 2x`}
                    width="45"
                    height="50"
                    alt=""
                    style={{ filter: `drop-shadow(0 4px 24px ${badge.shadow})` }}
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
