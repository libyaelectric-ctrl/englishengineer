export {
  type GamificationMissionCadence,
  type GamificationMissionCategory,
  type GamificationLevelInfo,
  type GamificationMissionTemplate,
  type GamificationMissionProgress,
  type GamificationReward,
  type GamificationRewardHistoryItem,
  type GamificationBonusSummary,
  type GamificationChallengeProgress,
  type GamificationSummary,
  type GamificationPersistedState,
  type GamificationStoreState,
} from './gamification.types';

export {
  getTodayKey,
  getWeekStart,
  getMonthStart,
  getLevelInfo,
  createRewardHistoryItem,
  getSessionCountForTemplate,
  buildMissionProgress,
} from './gamification.helpers';

export { GamificationService } from './gamification.service';

export { useGamificationStore } from './gamification.store';

export {
  LEVEL_XP_STEP,
  GAMIFICATION_MISSION_TEMPLATES,
  GAMIFICATION_TITLES,
} from './gamification.rules';

export {
  LEVEL_REWARDS,
  DAILY_LOGIN_REWARD,
  SESSION_COMPLETION_REWARD,
  PERFECT_SESSION_REWARD,
} from './gamification.rewards';

export {
  type ShopItemCategory,
  type ShopItem,
  type ShopPurchase,
  type ShopState,
  ShopService,
} from './gamification-shop';
