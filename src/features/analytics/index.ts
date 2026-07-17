export {
  type AnalyticsSkillName,
  type AnalyticsTrend,
  type AnalyticsTimelinePoint,
  type AnalyticsHeatmapPoint,
  type AnalyticsSkillSnapshot,
  type AnalyticsWeeklyActivity,
  type AnalyticsRecentSession,
  type AnalyticsRecentAchievement,
  type AnalyticsAIUsage,
  type AnalyticsNextStudy,
  type AnalyticsSummary,
  type AnalyticsAIContextSummary,
  type AnalyticsStoreState,
} from './analytics.types';

export {
  ANALYTICS_SKILLS,
  clampPercentage,
  calculateAverage,
  calculateGrowth,
  calculateTrend,
  calculateEstimatedCefr,
  calculateSkillRadar,
  calculateWeeklyActivity,
  calculateStudyHeatmap,
  calculateStudyConsistency,
  calculateImprovementVelocity,
  toXpTimeline,
  toEloTimeline,
  isAnalyticsSkill,
} from './analytics.calculations';

export {
  getRecentSessions,
  getRecentAchievements,
  getNextRecommendedStudy,
  buildAnalyticsAIContext,
  summarizeAnalyticsForDisplay,
} from './analytics.helpers';

export { AnalyticsService } from './analytics.service';

export { useAnalyticsStore } from './analytics.store';

export {
  PRODUCT_ANALYTICS_EVENT_NAMES,
  type ProductAnalyticsEventName,
  type ProductAnalyticsSkill,
  type ProductAnalyticsMetadata,
  type ProductAnalyticsEvent,
  type ProductAnalyticsProvider,
  type ProductAnalyticsProviderMode,
} from './product-analytics.types';

export {
  PRODUCT_ANALYTICS_STORAGE_KEY,
  LocalProductAnalyticsProvider,
  ConsoleProductAnalyticsProvider,
  PostHogProductAnalyticsProvider,
} from './product-analytics.provider';

export {
  sanitizeProductAnalyticsMetadata,
  ProductAnalyticsService,
} from './product-analytics.service';

export {
  type ReportData,
  type SkillBreakdown,
  type VocabularyStats,
  type ActivityEntry,
  LearningReportGenerator,
} from './learning-report-generator';

export {
  type SkillRadarData,
  type HeatmapDay,
  type AnalyticsInsight,
  type ProductivityPattern,
  AnalyticsDashboardV2,
} from './analytics-dashboard-v2';
