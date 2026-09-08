import { DEFAULT_ACHIEVEMENTS } from '../learning.achievements.data';
import { MAX_HEARTS } from '../learning.hearts';
import type { LearningState } from '../learning.types';

export type GamificationState = Pick<
  LearningState,
  'achievements' | 'xp' | 'level' | 'coins' | 'hearts' | 'heartsDepletedAt'
>;

export const createInitialGamificationState = (): GamificationState => ({
  achievements: DEFAULT_ACHIEVEMENTS,
  xp: 0,
  level: 1,
  coins: 0,
  hearts: MAX_HEARTS,
  heartsDepletedAt: null,
});
