export {
  type Result,
  type OkResult,
  type FailResult,
  ok,
  fail,
  isOk,
  isFail,
  mapResult,
  unwrapOr,
} from './result';

export {
  type ErrorCode,
  type ErrorSeverity,
  type AppErrorParams,
  AppError,
  isAppError,
  toAppError,
  createValidationError,
  createStorageError,
  createSystemError,
} from './errors';

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

export { type ServiceMetadata, BaseService } from './services';

export { type IRepository, BaseRepository } from './repositories';

export {
  type EntityId,
  type Timestamp,
  type BaseEntity,
  type AuditableEntity,
  type SoftDeletableEntity,
  isAuditable,
  isSoftDeletable,
  createAuditProps,
  updateAuditProps,
  createSoftDeleteProps,
} from './entities';

export { type IdPrefix, IdService } from './ids';

export { clock, formatDate, formatRelativeTime } from './time';

export {
  type ValidationError,
  type ValidationResult,
  validationHelpers,
  combineValidations,
} from './validation';

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
