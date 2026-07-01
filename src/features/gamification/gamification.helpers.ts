import { LearningState } from '@/core/learning/learning.types';
import { IdService } from '@/core/ids/id.service';
import { AnalyticsSummary } from '@/features/analytics';
import {
  GamificationMissionProgress,
  GamificationMissionTemplate,
  GamificationReward,
  GamificationRewardHistoryItem,
} from './gamification.types';
import { LEVEL_XP_STEP } from './gamification.rules';
import { LEVEL_REWARDS } from './gamification.rewards';

export const getTodayKey = (): string => new Date().toISOString().split('T')[0];

export const getWeekStart = (date = new Date()): Date => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const getMonthStart = (date = new Date()): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const getLevelInfo = (xp: number) => {
  const currentLevel = Math.floor(xp / LEVEL_XP_STEP) + 1;
  const levelStartXp = (currentLevel - 1) * LEVEL_XP_STEP;
  const nextLevelXp = currentLevel * LEVEL_XP_STEP;
  const xpRequired = Math.max(0, nextLevelXp - xp);
  const progressPercentage = Math.round(
    ((xp - levelStartXp) / LEVEL_XP_STEP) * 100
  );
  const nextReward =
    LEVEL_REWARDS.find(
      (reward) => reward.id === `reward_level_${currentLevel + 1}`
    )?.title || 'Engineer Elite reward tier';

  return {
    currentLevel,
    currentXp: xp,
    levelStartXp,
    nextLevelXp,
    xpRequired,
    progressPercentage,
    nextReward,
  };
};

export const createRewardHistoryItem = (
  reward: GamificationReward
): GamificationRewardHistoryItem => ({
  id: IdService.createId('reward'),
  title: reward.title,
  description: reward.description,
  timestamp: new Date().toISOString(),
  xp: reward.xp,
  coins: reward.coins,
});

export const getSessionCountForTemplate = (
  template: GamificationMissionTemplate,
  state: LearningState,
  analytics: AnalyticsSummary
): number => {
  const now = new Date();
  const fromDate =
    template.cadence === 'daily'
      ? new Date(getTodayKey())
      : template.cadence === 'weekly'
        ? getWeekStart(now)
        : getMonthStart(now);

  if (template.category === 'AI Coach')
    return analytics.aiCoachUsage.totalSessions > 0 ? 1 : 0;
  if (template.category === 'Analytics')
    return analytics.recentSessions.length > 0 ? 1 : 0;

  const sessions = state.studySessions.filter(
    (session) => new Date(session.timestamp) >= fromDate
  );
  if (template.category === 'Mixed') return sessions.length;
  return sessions.filter((session) => session.module === template.category)
    .length;
};

export const buildMissionProgress = (
  template: GamificationMissionTemplate,
  state: LearningState,
  analytics: AnalyticsSummary
): GamificationMissionProgress => {
  const progress = Math.min(
    template.target,
    getSessionCountForTemplate(template, state, analytics)
  );
  return {
    template,
    progress,
    isCompleted: progress >= template.target,
  };
};
