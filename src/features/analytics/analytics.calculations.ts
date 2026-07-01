import {
  LearningState,
  MissionModule,
  StudySession,
} from '@/core/learning/learning.types';
import { ProgressService } from '@/core/learning/progress.service';
import {
  AnalyticsHeatmapPoint,
  AnalyticsSkillName,
  AnalyticsSkillSnapshot,
  AnalyticsTimelinePoint,
  AnalyticsTrend,
  AnalyticsWeeklyActivity,
} from './analytics.types';

export const ANALYTICS_SKILLS: AnalyticsSkillName[] = [
  'Reading',
  'Writing',
  'Listening',
  'Speaking',
  'Vocabulary',
];

export const clampPercentage = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));

export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
};

export const calculateGrowth = (values: number[]): number => {
  if (values.length < 2) return 0;
  return values[values.length - 1] - values[0];
};

export const calculateTrend = (sessions: StudySession[]): AnalyticsTrend => {
  if (sessions.length < 3) return 'stable';
  const midpoint = Math.floor(sessions.length / 2);
  const earlierAverage = calculateAverage(
    sessions.slice(0, midpoint).map((session) => session.score)
  );
  const recentAverage = calculateAverage(
    sessions.slice(midpoint).map((session) => session.score)
  );
  const delta = recentAverage - earlierAverage;
  if (delta >= 5) return 'up';
  if (delta <= -5) return 'down';
  return 'stable';
};

export const calculateEstimatedCefr = (state: LearningState): string => {
  const summary = ProgressService.getSummary(state);
  const compositeScore =
    summary.averageScore * 0.5 +
    Math.min(summary.elo / 16, 100) * 0.3 +
    summary.completionPercentage * 0.2;

  if (compositeScore >= 90) return 'C1';
  if (compositeScore >= 78) return 'B2+';
  if (compositeScore >= 66) return 'B2';
  if (compositeScore >= 54) return 'B1+';
  return 'B1';
};

export const calculateSkillRadar = (
  state: LearningState
): AnalyticsSkillSnapshot[] =>
  ANALYTICS_SKILLS.map((module) => {
    const sessions = state.studySessions.filter(
      (session) => session.module === module
    );
    const completedMissions = state.missions.filter(
      (mission) => mission.module === module && mission.status === 'completed'
    ).length;
    return {
      module,
      averageScore: calculateAverage(sessions.map((session) => session.score)),
      completedMissions,
      sessionCount: sessions.length,
      totalMinutes: sessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0
      ),
      trend: calculateTrend(sessions),
    };
  });

export const calculateWeeklyActivity = (
  state: LearningState
): AnalyticsWeeklyActivity[] => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().split('T')[0];
    const sessions = state.studySessions.filter(
      (session) => session.timestamp.split('T')[0] === key
    );
    return {
      date: key,
      sessions: sessions.length,
      minutes: sessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0
      ),
    };
  });
};

export const calculateStudyHeatmap = (
  state: LearningState
): AnalyticsHeatmapPoint[] => {
  const today = new Date();
  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (27 - index));
    const key = date.toISOString().split('T')[0];
    const sessions = state.studySessions.filter(
      (session) => session.timestamp.split('T')[0] === key
    );
    return {
      date: key,
      count: sessions.length,
      minutes: sessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0
      ),
      averageScore: calculateAverage(sessions.map((session) => session.score)),
    };
  });
};

export const calculateStudyConsistency = (
  weeklyActivity: AnalyticsWeeklyActivity[]
): number => {
  const activeDays = weeklyActivity.filter((day) => day.sessions > 0).length;
  return clampPercentage(
    (activeDays / Math.max(weeklyActivity.length, 1)) * 100
  );
};

export const calculateImprovementVelocity = (state: LearningState): number => {
  const scores = state.scoreHistory.map((item) => item.score);
  if (scores.length < 2) return 0;
  const recent = calculateAverage(scores.slice(-3));
  const earlier = calculateAverage(
    scores.slice(0, Math.max(1, scores.length - 3))
  );
  return recent - earlier;
};

export const toXpTimeline = (state: LearningState): AnalyticsTimelinePoint[] =>
  state.xpHistory.map((item) => ({
    date: item.date,
    value: item.amount,
    label: item.reason,
  }));

export const toEloTimeline = (state: LearningState): AnalyticsTimelinePoint[] =>
  state.eloHistory.map((item) => ({
    date: item.date,
    value: item.value,
    label: 'ELO',
  }));

export const isAnalyticsSkill = (
  module: MissionModule
): module is AnalyticsSkillName =>
  ANALYTICS_SKILLS.includes(module as AnalyticsSkillName);
