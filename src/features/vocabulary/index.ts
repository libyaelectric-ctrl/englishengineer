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
} from './vocabulary.types';

export { isVocabularyTerm, assertVocabularyTerms } from './vocabulary.schema';

export { VocabularyRepository } from './vocabulary.repository';

export { VocabularyEngine } from './vocabulary.engine';

export {
  loadVocabularyEntries,
  getVocabularyEntries,
  getVocabularyEntriesOrWait,
} from './vocabulary.data';

export {
  normalizeVocabularyText,
  isVocabularyResponseCorrect,
  getTodayDateKey,
  getPreviousDateKey,
  isDueForReview,
  sortByNextReview,
} from './vocabulary.helpers';

export { VocabularyEvaluator } from './vocabulary.evaluator';

export { VocabularyService } from './vocabulary.service';

export { useVocabularyStore } from './vocabulary.store';

export {
  isVocabularyWordDue,
  filterMyVocabulary,
  VocabularyMemoryService,
} from './vocabulary.memory';

export { useVocabularyMemoryStore } from './vocabulary.memory.store';

export {
  searchVocabularyEntries,
  lookupExternalVocabulary,
  isExternalVocabularyResult,
  clearVocabularyLookupCache,
} from './vocabulary.search';

export {
  createInitialReviewState,
  updateSm2ReviewState,
} from './vocabulary.spaced-repetition';

export {
  type DueTodayItem,
  getDueTodayWords,
  getUpcomingReviews,
  getReviewStats,
} from './vocabulary-due-today';

export {
  CANONICAL_VOCABULARY_TOTAL,
  type VocabularyMenuStatus,
  type VocabularyMenuProgress,
  type MyVocabularyWord,
  type VocabularyMenuState,
  type VocabularyMenuSummary,
  type AddMyVocabularyInput,
  type VocabularySearchFilters,
  repairVocabularyText,
  isVocabularyProgressDue,
  isVocabularyForgotten,
  getVocabularyReviewReason,
  getVocabularyMenuStatus,
  searchVocabularyMenu,
  VocabularyMenuService,
} from './vocabulary.menu';

export {
  type VocabularyLearningSetOptions,
  selectVocabularyLearningSet,
} from './vocabulary.selection';
