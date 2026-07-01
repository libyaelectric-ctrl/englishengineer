import { MissionModule } from '@/core/learning/learning.types';
import { AssessmentProfile } from '@/features/assessment';
import { VocabularySummary } from '@/features/vocabulary';

export type AnalyticsSkillName = Extract<
  MissionModule,
  'Reading' | 'Writing' | 'Listening' | 'Speaking' | 'Vocabulary'
>;
export type AnalyticsTrend = 'up' | 'down' | 'stable';

export interface AnalyticsTimelinePoint {
  date: string;
  value: number;
  label: string;
}

export interface AnalyticsHeatmapPoint {
  date: string;
  count: number;
  minutes: number;
  averageScore: number;
}

export interface AnalyticsSkillSnapshot {
  module: AnalyticsSkillName;
  averageScore: number;
  completedMissions: number;
  sessionCount: number;
  totalMinutes: number;
  trend: AnalyticsTrend;
}

export interface AnalyticsWeeklyActivity {
  date: string;
  sessions: number;
  minutes: number;
}

export interface AnalyticsRecentSession {
  timestamp: string;
  module: MissionModule;
  score: number;
  durationMinutes: number;
}

export interface AnalyticsRecentAchievement {
  id: string;
  title: string;
  unlockedAt: string;
}

export interface AnalyticsAIUsage {
  totalSessions: number;
  mostUsedMode: string;
  suggestedFocusArea: string;
  lastUsedAt: string | null;
}

export interface AnalyticsNextStudy {
  module: string;
  title: string;
  reason: string;
}

export interface AnalyticsSummary {
  overallProgress: number;
  estimatedCefr: string;
  skillRadar: AnalyticsSkillSnapshot[];
  xpTimeline: AnalyticsTimelinePoint[];
  eloTimeline: AnalyticsTimelinePoint[];
  weeklyActivity: AnalyticsWeeklyActivity[];
  studyHeatmap: AnalyticsHeatmapPoint[];
  recentSessions: AnalyticsRecentSession[];
  recentAchievements: AnalyticsRecentAchievement[];
  weakSkills: string[];
  strongSkills: string[];
  vocabularyRetention: number;
  vocabularySummary: VocabularySummary;
  aiCoachUsage: AnalyticsAIUsage;
  nextRecommendedStudy: AnalyticsNextStudy;
  xpGrowth: number;
  eloGrowth: number;
  studyConsistency: number;
  averageSessionLength: number;
  retention: number;
  improvementVelocity: number;
  assessmentProfile: AssessmentProfile;
}

export interface AnalyticsAIContextSummary {
  estimatedCefr: string;
  weakestSkills: string[];
  strongestSkills: string[];
  recommendedFocus: string;
  improvementVelocity: number;
  studyConsistency: number;
  vocabularyRetention: number;
  aiCoachSessions: number;
}

export interface AnalyticsStoreState {
  activeChart: 'overview' | 'xp' | 'elo' | 'skills' | 'vocabulary';
  setActiveChart: (chart: AnalyticsStoreState['activeChart']) => void;
}
