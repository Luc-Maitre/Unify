import badgeSwap1x      from './assets/achievements/badge-swap.png';
import badgeSwap2x      from './assets/achievements/badge-swap@2x.png';
import badgeOpen51x     from './assets/achievements/badge-open-5.png';
import badgeOpen52x     from './assets/achievements/badge-open-5@2x.png';
import badgeOpen201x    from './assets/achievements/badge-open-20.png';
import badgeOpen202x    from './assets/achievements/badge-open-20@2x.png';
import badgeOpen501x    from './assets/achievements/badge-open-50.png';
import badgeOpen502x    from './assets/achievements/badge-open-50@2x.png';
import badgeExpert1x    from './assets/achievements/badge-expert.png';
import badgeExpert2x    from './assets/achievements/badge-expert@2x.png';
import badgeLightDark1x from './assets/achievements/badge-light-dark.png';
import badgeLightDark2x from './assets/achievements/badge-light-dark@2x.png';

export interface BadgeConfig {
  src1x: string;
  src2x: string;
  shadow: string;
  shimmer: string;
}

const BADGE_CONFIG: Record<string, BadgeConfig> = {
  'first-swap': { src1x: badgeSwap1x,      src2x: badgeSwap2x,      shadow: 'rgba(6, 214, 160, 0.60)',   shimmer: '#06D6A0' },
  'open-5':     { src1x: badgeOpen51x,     src2x: badgeOpen52x,     shadow: 'rgba(184, 115, 79, 0.60)',  shimmer: '#B8734F' },
  'open-20':    { src1x: badgeOpen201x,    src2x: badgeOpen202x,    shadow: 'rgba(174, 184, 186, 0.60)', shimmer: '#AEB8BA' },
  'open-50':    { src1x: badgeOpen501x,    src2x: badgeOpen502x,    shadow: 'rgba(214, 169, 59, 0.60)',  shimmer: '#D6A93B' },
  'expert':     { src1x: badgeExpert1x,    src2x: badgeExpert2x,    shadow: 'rgba(0, 208, 136, 0.60)',   shimmer: '#06D6A0' },
  'light-dark': { src1x: badgeLightDark1x, src2x: badgeLightDark2x, shadow: 'rgba(72, 202, 228, 0.60)', shimmer: '#06D6A0' },
};

const FALLBACK: BadgeConfig = BADGE_CONFIG['first-swap'];

export function getBadgeConfig(id: string): BadgeConfig {
  return BADGE_CONFIG[id] ?? FALLBACK;
}

export const TOTAL_ACHIEVEMENTS = Object.keys(BADGE_CONFIG).length;
