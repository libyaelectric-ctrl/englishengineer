import { LearningState } from '@/core/learning/learning.types';
import { AnalyticsService } from '@/features/analytics';
import { getLevelInfo, buildMissionProgress } from './gamification.helpers';
import {
  LEVEL_REWARDS,
  PERFECT_SESSION_REWARD,
  SESSION_COMPLETION_REWARD,
} from './gamification.rewards';
import {
  GAMIFICATION_MISSION_TEMPLATES,
  GAMIFICATION_TITLES,
} from './gamification.rules';
import {
  GamificationPersistedState,
  GamificationSummary,
} from './gamification.types';

export const GamificationService = {
  getSummary(
    state: LearningState,
    persisted: GamificationPersistedState
  ): GamificationSummary {
    const analytics = AnalyticsService.getSummary(state);
    const missionProgress = GAMIFICATION_MISSION_TEMPLATES.map((template) =>
      buildMissionProgress(template, state, analytics)
    );
    const dailyMissions = missionProgress.filter(
      (mission) => mission.template.cadence === 'daily'
    );
    const weeklyMissions = missionProgress.filter(
      (mission) => mission.template.cadence === 'weekly'
    );
    const monthlyGoals = missionProgress.filter(
      (mission) => mission.template.cadence === 'monthly'
    );
    const perfectSessions = state.studySessions.filter(
      (session) => session.score >= 100
    ).length;
    const completedDaily = dailyMissions.filter(
      (mission) => mission.isCompleted
    ).length;
    const completedWeekly = weeklyMissions.filter(
      (mission) => mission.isCompleted
    ).length;
    const completedMonthly = monthlyGoals.filter(
      (mission) => mission.isCompleted
    ).length;
    const levelInfo = getLevelInfo(state.xp);
    const nextLevelReward =
      LEVEL_REWARDS.find(
        (reward) => reward.id === `reward_level_${levelInfo.currentLevel + 1}`
      ) || LEVEL_REWARDS[LEVEL_REWARDS.length - 1];
    const titles = GAMIFICATION_TITLES.filter(
      (title) => levelInfo.currentLevel >= title.threshold
    ).map((title) => title.title);

    return {
      levelInfo,
      coins: state.coins,
      streak: state.streak,
      dailyMissions,
      weeklyMissions,
      monthlyGoals,
      learningChallenges: missionProgress,
      bonusSummary: {
        xpMultiplier: state.streak >= 7 ? 1.25 : state.streak >= 3 ? 1.1 : 1,
        comboBonus: completedDaily >= 2 ? 15 : 0,
        perfectSessionBonus: perfectSessions * PERFECT_SESSION_REWARD.xp,
        consistencyBonus: analytics.studyConsistency >= 70 ? 30 : 0,
        comebackBonus:
          state.streak === 1 && state.studySessions.length > 3 ? 20 : 0,
      },
      recentRewards: persisted.rewardHistory.slice(0, 8),
      achievementFeed: state.achievements
        .filter((achievement) => achievement.unlocked && achievement.unlockedAt)
        .map((achievement) => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          timestamp: achievement.unlockedAt || '',
          xp: 0,
          coins: 0,
        }))
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 8),
      nextReward: nextLevelReward || SESSION_COMPLETION_REWARD,
      challengeProgress: {
        dailyCompleted: completedDaily,
        weeklyCompleted: completedWeekly,
        monthlyCompleted: completedMonthly,
        activeChains: missionProgress.filter(
          (mission) => mission.progress > 0 && !mission.isCompleted
        ).length,
      },
      titles,
    };
  },
};
