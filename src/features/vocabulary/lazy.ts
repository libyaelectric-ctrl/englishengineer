import { lazy } from 'react';

export const LazyVocabularyPage = lazy(() => import('@/pages/VocabularyPage'));
export const LazyVocabularyService = () => import('./vocabulary.service');
export const LazyVocabularyStore = () => import('./vocabulary.store');
export const LazyVocabularyData = () => import('./vocabulary.data');
