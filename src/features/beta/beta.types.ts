export type BetaFeedbackType =
  | 'bug_report'
  | 'content_issue'
  | 'ux_problem'
  | 'suggestion'
  | 'other';

export interface BetaOnboardingProfile {
  engineeringDiscipline: string;
  experienceLevel: string;
  currentEnglishLevel: string;
  targetEnglishLevel: string;
  industry: string;
  dailyStudyGoal: string;
  careerGoal: string;
  timezone: string;
  learningPathChoice?: 'start_a1' | 'placement_check' | 'explore_demo';
  completedAt: string;
}

export interface BetaFeedbackEntry {
  id: string;
  type: BetaFeedbackType;
  message: string;
  difficultyRating: number;
  missionRating: number;
  aiFeedbackRating: number;
  uxRating: number;
  screen: string;
  context?: string;
  screenshotName?: string;
  createdAt: string;
}

export interface ProductAnalyticsSummary {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  missionCompletionRate: number;
  writingCompletionRate: number;
  listeningCompletionRate: number;
  speakingCompletionRate: number;
  vocabularyCompletionRate: number;
  averageSessionDurationSeconds: number;
  averageMissionsPerSession: number;
  dropOffScreens: string[];
  mostUsedFeatures: string[];
  leastUsedFeatures: string[];
  retentionIndicators: string[];
  returningUsers: number;
  templatesUsed: number;
  quickAIActionsUsed: number;
  dailyTasksCompleted: number;
  sevenDayReportsGenerated: number;
  paymentIntent: number;
}
export type { ProductAnalyticsEvent } from '@/features/analytics/product-analytics.types';
