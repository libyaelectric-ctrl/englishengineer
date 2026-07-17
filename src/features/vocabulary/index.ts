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

export { isVocabularyTerm, assertVocabularyTerms } from './types/vocabulary.schema';

export { VocabularyRepository } from './services/vocabulary.repository';

export { VocabularyEngine } from './engine/vocabulary.engine';

export {
  loadVocabularyEntries,
  getVocabularyEntries,
  getVocabularyEntriesOrWait,
} from './data/vocabulary.data';

export {
  normalizeVocabularyText,
  isVocabularyResponseCorrect,
  getTodayDateKey,
  getPreviousDateKey,
  isDueForReview,
  sortByNextReview,
} from './engine/vocabulary.helpers';

export { VocabularyEvaluator } from './engine/vocabulary.evaluator';

export { VocabularyService } from './services/vocabulary.service';

export { useVocabularyStore } from './store/vocabulary.store';

export {
  isVocabularyWordDue,
  filterMyVocabulary,
  VocabularyMemoryService,
} from './services/vocabulary.memory';

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
  repairVocabularyText,
  isVocabularyProgressDue,
  isVocabularyForgotten,
  getVocabularyReviewReason,
  getVocabularyMenuStatus,
  searchVocabularyMenu,
  VocabularyMenuService,
} from './services/vocabulary.menu';

export {
  type VocabularyLearningSetOptions,
  selectVocabularyLearningSet,
} from './services/vocabulary.selection';
