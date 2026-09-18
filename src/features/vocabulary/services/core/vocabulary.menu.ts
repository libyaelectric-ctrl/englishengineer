/**
 * Vocabulary Menu Service - re-exports from shared service.
 * The canonical implementation is in shared/services/vocabulary-menu.service.ts.
 */
export {
  CANONICAL_VOCABULARY_TOTAL,
  type VocabularyMenuStatus,
  type VocabularyMenuProgress,
  type VocabularyMenuState,
  type VocabularySearchFilters,
  repairVocabularyText,
  isVocabularyProgressDue,
  isVocabularyForgotten,
  getVocabularyReviewReason,
  isLeechWord,
  getVocabularyMenuStatus,
  searchVocabularyMenu,
  VocabularyMenuService,
} from '@/shared/services/vocabulary-menu.service';
