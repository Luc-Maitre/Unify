import badgeSwap1x    from './assets/achievements/badge-swap.png';
import badgeSwap2x    from './assets/achievements/badge-swap@2x.png';
import badgeOpen51x   from './assets/achievements/badge-open-5.png';
import badgeOpen52x   from './assets/achievements/badge-open-5@2x.png';
import badgeOpen201x  from './assets/achievements/badge-open-20.png';
import badgeOpen202x  from './assets/achievements/badge-open-20@2x.png';
import badgeOpen501x  from './assets/achievements/badge-open-50.png';
import badgeOpen502x  from './assets/achievements/badge-open-50@2x.png';

export interface BadgeConfig {
  src1x: string;
  src2x: string;
  shadow: string;
}

const BADGE_CONFIG: Record<string, BadgeConfig> = {
  'first-swap': { src1x: badgeSwap1x,   src2x: badgeSwap2x,   shadow: 'rgba(6, 214, 160, 0.60)'   },
  'open-5':     { src1x: badgeOpen51x,  src2x: badgeOpen52x,  shadow: 'rgba(184, 115, 79, 0.60)'  },
  'open-20':    { src1x: badgeOpen201x, src2x: badgeOpen202x, shadow: 'rgba(174, 184, 186, 0.60)' },
  'open-50':    { src1x: badgeOpen501x, src2x: badgeOpen502x, shadow: 'rgba(214, 169, 59, 0.60)'  },
};

const FALLBACK: BadgeConfig = BADGE_CONFIG['first-swap'];

export function getBadgeConfig(id: string): BadgeConfig {
  return BADGE_CONFIG[id] ?? FALLBACK;
}
