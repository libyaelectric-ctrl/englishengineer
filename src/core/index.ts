export { type ErrorCode, type ErrorSeverity, type AppErrorParams, AppError } from './errors';

export {
  type AppEvent,
  type BaseEvent,
  type AppStartedEvent,
  type AppErrorEvent,
  type RouteChangedEvent,
  type UserActionEvent,
  type LearningStartedEvent,
  type LearningCompletedEvent,
  type XpEarnedEvent,
  type BadgeUnlockedEvent,
  type AICoachStartedEvent,
  type AICoachCompletedEvent,
  type AICoachFailedEvent,
  type VocabularyMasteredEvent,
  type GrammarMasteredEvent,
  type EventSubscriptionToken,
  type AppEventHandler,
  EventStore,
  globalEventStore,
  eventBus,
} from './events';

export { type EntityId, type Timestamp } from './entities';

export { type IdPrefix, IdService } from './ids';

export {
  type MissionModule,
  type MissionDifficulty,
  type MissionStatus,
  type Mission,
  type ScoreResult,
  type Achievement,
  type StudySession,
  type HistoryItem,
  type LearningState,
  ScoringService,
  type ProgressSummary,
  ProgressService,
  AchievementService,
  type LearningStoreActions,
  useLearningStore,
  addToVocabularyPool,
  addToGrammarPool,
  type LearningDataSkill,
  type UserSkillProfile,
  getLevelsThrough,
  isCefrAtOrBelow,
  includesNormalized,
  extractCefrFromId,
} from './learning';
