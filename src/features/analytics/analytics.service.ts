import { LearningState } from '@/core/learning/learning.types';
import { ProgressService } from '@/core/learning/progress.service';
import { getStoredAIUsageSummary } from '@/features/ai';
import { AssessmentService } from '@/features/assessment';
import { VocabularyService } from '@/features/vocabulary';
import {
  calculateAverage,
  calculateEstimatedCefr,
  calculateGrowth,
  calculateImprovementVelocity,
  calculateSkillRadar,
  calculateStudyConsistency,
  calculateStudyHeatmap,
  calculateWeeklyActivity,
  toEloTimeline,
  toXpTimeline,
} from './analytics.calculations';
import {
  buildAnalyticsAIContext,
  getNextRecommendedStudy,
  getRecentAchievements,
  getRecentSessions,
} from './analytics.helpers';
import { AnalyticsAIContextSummary, AnalyticsSummary } from './analytics.types';

export const AnalyticsService = {
  getSummary(state: LearningState): AnalyticsSummary {
    const progress = ProgressService.getSummary(state);
    const skills = ProgressService.getSkillAnalysis(state);
    const vocabularySummary = VocabularyService.getSummary();
    const aiUsage = getStoredAIUsageSummary();
    const assessmentProfile = AssessmentService.getProfile(state);
    const weeklyActivity = calculateWeeklyActivity(state);
    const scoreValues = state.scoreHistory.map((item) => item.score);
    const retention =
      vocabularySummary.retentionPercentage || progress.averageScore;
    const nextRecommendedStudy = getNextRecommendedStudy(
      state,
      skills.weakSkills,
      vocabularySummary
    );

    return {
      overallProgress: progress.completionPercentage,
      estimatedCefr: calculateEstimatedCefr(state),
      skillRadar: calculateSkillRadar(state),
      xpTimeline: toXpTimeline(state),
      eloTimeline: toEloTimeline(state),
      weeklyActivity,
      studyHeatmap: calculateStudyHeatmap(state),
      recentSessions: getRecentSessions(state),
      recentAchievements: getRecentAchievements(state),
      weakSkills: skills.weakSkills,
      strongSkills: skills.strongSkills,
      vocabularyRetention: vocabularySummary.retentionPercentage,
      vocabularySummary,
      aiCoachUsage: {
        totalSessions: aiUsage.totalSessions,
        mostUsedMode: aiUsage.mostUsedMode,
        suggestedFocusArea: aiUsage.suggestedFocusArea,
        lastUsedAt: aiUsage.recentSession?.timestamp || null,
      },
      nextRecommendedStudy,
      xpGrowth: calculateGrowth(state.xpHistory.map((item) => item.amount)),
      eloGrowth: calculateGrowth(state.eloHistory.map((item) => item.value)),
      studyConsistency: calculateStudyConsistency(weeklyActivity),
      averageSessionLength: calculateAverage(
        state.studySessions.map((session) => session.durationMinutes)
      ),
      retention,
      improvementVelocity:
        scoreValues.length > 0 ? calculateImprovementVelocity(state) : 0,
      assessmentProfile,
    };
  },

  getAIContextSummary(state: LearningState): AnalyticsAIContextSummary {
    return buildAnalyticsAIContext(this.getSummary(state));
  },
};
