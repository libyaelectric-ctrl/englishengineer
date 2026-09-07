export { VocabularyRepository } from './services/core/vocabulary.repository';

export { VocabularyService } from './services/core/vocabulary.service';

export { useVocabularyStore } from './store/vocabulary.store';

export {
  VocabularyMenuService,
  isVocabularyProgressDue,
  repairVocabularyText,
  searchVocabularyMenu,
  getVocabularyReviewReason,
} from './services/core/vocabulary.menu';

export { selectVocabularyLearningSet } from './services/core/vocabulary.selection';

export { PronunciationService } from './services/content/vocabulary.pronunciation';

export { SentenceGeneratorService } from './services/content/vocabulary.sentences';

export type {
  VocabularyMenuStatus,
  VocabularyMenuProgress,
  VocabularyMenuState,
  VocabularySearchFilters,
} from './services/core/vocabulary.menu';

export type { VocabularyTerm } from '@/shared/types/vocabulary.types';

export type { SentenceExample } from './services/content/vocabulary.sentences';
