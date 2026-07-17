import { lazy } from 'react';

export const LazyVocabularyPage = lazy(() => import('@/pages/VocabularyPage'));
export const LazyVocabularyService = () =>
  import('./services/vocabulary.service');
export const LazyVocabularyStore = () => import('./store/vocabulary.store');
export const LazyVocabularyData = () => import('./data/vocabulary.data');
