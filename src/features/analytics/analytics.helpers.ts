import { LearningState } from '@/core/learning/learning.types';
import { ProgressService } from '@/core/learning/progress.service';
import { VocabularySummary } from '@/features/vocabulary/types/vocabulary.types';
import {
  AnalyticsAIContextSummary,
  AnalyticsNextStudy,
  AnalyticsRecentAchievement,
  AnalyticsRecentSession,
  AnalyticsSummary,
} from './analytics.types';

export const getRecentSessions = (
  state: LearningState,
  limit = 8
): AnalyticsRecentSession[] =>
  state.studySessions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);

export const getRecentAchievements = (
  state: LearningState,
  limit = 6
): AnalyticsRecentAchievement[] =>
  state.achievements
    .filter((achievement) => achievement.unlocked && achievement.unlockedAt)
    .map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      unlockedAt: achievement.unlockedAt || '',
    }))
    .sort(
      (a, b) =>
        new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
    )
    .slice(0, limit);

export const getNextRecommendedStudy = (
  state: LearningState,
  weakSkills: string[],
  vocabularySummary: VocabularySummary
): AnalyticsNextStudy => {
  if (vocabularySummary.todaysReviews > 0) {
    return {
      module: 'Vocabulary',
      title: 'Vocabulary Review',
      reason: `${vocabularySummary.todaysReviews} terms are ready for spaced repetition.`,
    };
  }

  const firstWeakSkill = weakSkills.find((skill) => skill !== 'None');
  if (firstWeakSkill) {
    const mission = state.missions.find(
      (item) => item.module === firstWeakSkill && item.status !== 'completed'
    );
    return {
      module: firstWeakSkill,
      title: mission?.title || `${firstWeakSkill} practice`,
      reason: `${firstWeakSkill} is currently the lowest scoring skill area.`,
    };
  }

  const availableMission = state.missions.find(
    (mission) => mission.status === 'available' || mission.status === 'active'
  );
  return {
    module: availableMission?.module || 'Reading',
    title: availableMission?.title || 'Balanced review session',
    reason: 'Maintain balanced progress across the core learning engines.',
  };
};

export const buildAnalyticsAIContext = (
  summary: AnalyticsSummary
): AnalyticsAIContextSummary => ({
  estimatedCefr: summary.estimatedCefr,
  weakestSkills: summary.weakSkills,
  strongestSkills: summary.strongSkills,
  recommendedFocus: summary.nextRecommendedStudy.module,
  improvementVelocity: summary.improvementVelocity,
  studyConsistency: summary.studyConsistency,
  vocabularyRetention: summary.vocabularyRetention,
  aiCoachSessions: summary.aiCoachUsage.totalSessions,
});

export const summarizeAnalyticsForDisplay = (
  state: LearningState
): string[] => {
  const progress = ProgressService.getSummary(state);
  return [
    `${progress.completionPercentage}% overall progress`,
    `${progress.averageScore}% average score`,
    `${progress.totalStudyTimeMinutes} total study minutes`,
    `${progress.streak} day streak`,
  ];
};
