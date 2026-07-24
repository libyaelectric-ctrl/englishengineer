export {
  type VocabularyDiscipline,
  type VocabularyTrainingMode,
  type VocabularyWordStatus,
  type VocabularyWordSource,
  type MyVocabularyFilter,
  type VocabularyEntry,
  type VocabularyTerm,
  type SavedVocabularyWord,
  type VocabularyMemoryState,
  type VocabularyMemorySummary,
  type ExternalVocabularyResult,
  type ExternalLookupState,
  type VocabularyReviewState,
  type VocabularyAnswer,
  type VocabularyEvaluationResult,
  type VocabularyHistoryEntry,
  type VocabularyState,
  type VocabularySummary,
} from './types/vocabulary.types';

export {
  isVocabularyTerm,
  assertVocabularyTerms,
} from './types/vocabulary.schema';

export { VocabularyRepository } from './services/vocabulary.repository';

export { VocabularyEngine } from './engine/vocabulary.engine';

// Vocabulary data lazy-load icin dogrudan import edilmeli
// export { loadVocabularyEntries, getVocabularyEntries, getVocabularyEntriesOrWait } from './data/vocabulary.data';

export {
  normalizeVocabularyText,
  isVocabularyResponseCorrect,
  getTodayDateKey,
  getPreviousDateKey,
  isDueForReview,
  sortByNextReview,
} from './engine/vocabulary.helpers';

export { VocabularyEvaluator } from './engine/vocabulary.evaluator';

export {
  type ForgettingCurvePoint,
  type ForgettingCurveData,
  calculateRetention,
  estimateStability,
  generateForgettingCurve,
  generateMultiWordCurves,
  getRetentionColor,
  getRetentionLabel,
} from './engine/vocabulary.forgetting-curve';

export {
  type PrioritizedWord,
  calculateWordPriority,
  prioritizeWords,
  getSessionPriorityLabel,
} from './engine/vocabulary.session-optimizer';

export { VocabularyService } from './services/vocabulary.service';

export { useVocabularyStore } from './store/vocabulary.store';

export {
  isVocabularyWordDue,
  filterMyVocabulary,
  VocabularyMemoryService,
} from './services/vocabulary.memory';

export {
  type VocabularySyncState,
  type SyncConflict,
  VocabularySyncService,
} from './services/vocabulary.sync';

export {
  type ReviewReminderSettings,
  type ReviewReminderStatus,
  ReviewReminderService,
} from './services/vocabulary.reminder';

export {
  type VocabularyBadge,
  type VocabularyStats,
  type BadgeUnlockResult,
  VocabularyBadgeService,
} from './services/vocabulary.badges';

export {
  type SentenceExample,
  type GenerateSentencesResult,
  SentenceGeneratorService,
} from './services/vocabulary.sentences';

export {
  type PronunciationResult,
  PronunciationService,
} from './services/vocabulary.pronunciation';

export {
  type CsvWord,
  type ImportResult,
  VocabularyCsvService,
} from './services/vocabulary.csv';

export { useVocabularyMemoryStore } from './store/vocabulary.memory.store';

export {
  searchVocabularyEntries,
  lookupExternalVocabulary,
  isExternalVocabularyResult,
  clearVocabularyLookupCache,
} from './services/vocabulary.search';

export {
  createInitialReviewState,
  updateSm2ReviewState,
} from './spaced-repetition/vocabulary.spaced-repetition';

export {
  type DueTodayItem,
  getDueTodayWords,
  getUpcomingReviews,
  getReviewStats,
} from './spaced-repetition/vocabulary-due-today';

export {
  CANONICAL_VOCABULARY_TOTAL,
  type VocabularyMenuStatus,
  type VocabularyMenuProgress,
  type MyVocabularyWord,
  type VocabularyMenuState,
  type VocabularyMenuSummary,
  type AddMyVocabularyInput,
  type VocabularySearchFilters,
  type LearnedQuizCompletion,
  repairVocabularyText,
  isVocabularyProgressDue,
  isVocabularyForgotten,
  isLeechWord,
  getVocabularyReviewReason,
  getVocabularyMenuStatus,
  searchVocabularyMenu,
  VocabularyMenuService,
} from './services/vocabulary.menu';

export {
  type VocabularyLearningSetOptions,
  selectVocabularyLearningSet,
} from './services/vocabulary.selection';
