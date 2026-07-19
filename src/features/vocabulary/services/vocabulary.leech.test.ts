import { describe, it, expect } from 'vitest';
import {
  isLeechWord,
  type VocabularyMenuProgress,
} from './vocabulary.menu';

const makeProgress = (
  overrides: Partial<VocabularyMenuProgress> = {}
): VocabularyMenuProgress => ({
  correctReviews: 0,
  wrongReviews: 0,
  status: 'New',
  isWeak: false,
  isForgotten: false,
  isLeech: false,
  lastReviewed: '',
  nextReviewDate: '',
  ...overrides,
});

describe('isLeechWord', () => {
  it('returns false for words with fewer than 3 total reviews', () => {
    const progress = makeProgress({ correctReviews: 1, wrongReviews: 1 });
    expect(isLeechWord(progress)).toBe(false);
  });

  it('returns false when wrong ratio is below 0.6', () => {
    const progress = makeProgress({ correctReviews: 2, wrongReviews: 2 });
    expect(isLeechWord(progress)).toBe(false);
  });

  it('returns true when wrong ratio >= 0.6 with 3+ reviews', () => {
    const progress = makeProgress({ correctReviews: 1, wrongReviews: 3 });
    expect(isLeechWord(progress)).toBe(true);
  });

  it('returns true for all-wrong after 3 reviews', () => {
    const progress = makeProgress({ correctReviews: 0, wrongReviews: 3 });
    expect(isLeechWord(progress)).toBe(true);
  });

  it('returns false for all-correct after 3 reviews', () => {
    const progress = makeProgress({ correctReviews: 3, wrongReviews: 0 });
    expect(isLeechWord(progress)).toBe(false);
  });

  it('returns true at exactly 0.6 ratio', () => {
    const progress = makeProgress({ correctReviews: 2, wrongReviews: 3 });
    expect(isLeechWord(progress)).toBe(true);
  });
});
