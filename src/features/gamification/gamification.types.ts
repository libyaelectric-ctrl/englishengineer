import { MissionModule } from '@/core/learning/learning.types';

export type GamificationMissionCadence = 'daily' | 'weekly' | 'monthly';
export type GamificationMissionCategory =
  | MissionModule
  | 'Mixed'
  | 'AI Coach'
  | 'Analytics';

export interface GamificationLevelInfo {
  currentLevel: number;
  currentXp: number;
  levelStartXp: number;
  nextLevelXp: number;
  xpRequired: number;
  progressPercentage: number;
  nextReward: string;
}

export interface GamificationMissionTemplate {
  id: string;
  title: string;
  description: string;
  cadence: GamificationMissionCadence;
  category: GamificationMissionCategory;
  target: number;
  xpReward: number;
  coinReward: number;
}

export interface GamificationMissionProgress {
  template: GamificationMissionTemplate;
  progress: number;
  isCompleted: boolean;
}

export interface GamificationReward {
  id: string;
  title: string;
  description: string;
  xp: number;
  coins: number;
  badge?: string;
}

export interface GamificationRewardHistoryItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  xp: number;
  coins: number;
}

export interface GamificationBonusSummary {
  xpMultiplier: number;
  comboBonus: number;
  perfectSessionBonus: number;
  consistencyBonus: number;
  comebackBonus: number;
}

export interface GamificationChallengeProgress {
  dailyCompleted: number;
  weeklyCompleted: number;
  monthlyCompleted: number;
  activeChains: number;
}

export interface GamificationSummary {
  levelInfo: GamificationLevelInfo;
  coins: number;
  streak: number;
  dailyMissions: GamificationMissionProgress[];
  weeklyMissions: GamificationMissionProgress[];
  monthlyGoals: GamificationMissionProgress[];
  learningChallenges: GamificationMissionProgress[];
  bonusSummary: GamificationBonusSummary;
  recentRewards: GamificationRewardHistoryItem[];
  achievementFeed: GamificationRewardHistoryItem[];
  nextReward: GamificationReward;
  challengeProgress: GamificationChallengeProgress;
  titles: string[];
}

export interface GamificationPersistedState {
  rewardHistory: GamificationRewardHistoryItem[];
  claimedDailyLoginDate: string | null;
  challengeProgress: Record<string, number>;
}

export interface GamificationStoreState extends GamificationPersistedState {
  claimDailyLoginReward: () => GamificationRewardHistoryItem | null;
  addRewardHistoryItem: (reward: GamificationRewardHistoryItem) => void;
  clearRewardHistory: () => void;
}
