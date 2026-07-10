import type { VocabularySearchFilters } from '@/features/vocabulary';

export const emptyFilters = (): VocabularySearchFilters => ({
  cefr: 'All',
  domain: 'All',
  contentDomain: 'All',
  lifeContext: 'All',
  partOfSpeech: 'All',
  skillUse: 'All',
  status: 'All',
});
