import type { LearningState } from '../learning.types';

export type ContentPoolState = Pick<
  LearningState,
  'vocabularyPool' | 'grammarPool' | 'speakingPool' | 'weakTermIds'
>;

export const createInitialContentPoolState = (): ContentPoolState => ({
  vocabularyPool: [],
  grammarPool: [],
  speakingPool: [],
  weakTermIds: [],
});

export const addUniqueContent = (current: string[], contentIds: string[]): string[] =>
  Array.from(new Set([...current, ...contentIds]));

export const removeContent = (current: string[], contentId: string): string[] =>
  current.filter((id) => id !== contentId);
