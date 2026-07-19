import { describe, it, expect } from 'vitest';
import {
  calculateWordPriority,
  prioritizeWords,
  getSessionPriorityLabel,
} from './vocabulary.session-optimizer';
import type { VocabularyMenuProgress } from '../services/vocabulary.menu';

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

describe('Session Optimizer', () => {
  describe('calculateWordPriority', () => {
    it('returns high priority for leech words', () => {
      const progress = makeProgress({
        correctReviews: 1,
        wrongReviews: 3,
        isLeech: true,
      });
      const result = calculateWordPriority('w1', progress);
      expect(result.reason).toBe('leech');
      expect(result.priority).toBe(100);
    });

    it('returns high priority for forgotten words', () => {
      const progress = makeProgress({
        lastReviewed: '2025-01-01T00:00:00Z',
        isForgotten: true,
      });
      const result = calculateWordPriority(
        'w1',
        progress,
        new Date('2026-07-19')
      );
      expect(result.reason).toBe('forgotten');
      expect(result.priority).toBe(80);
    });

    it('returns medium priority for weak words', () => {
      const progress = makeProgress({ isWeak: true });
      const result = calculateWordPriority('w1', progress);
      expect(result.reason).toBe('weak');
      expect(result.priority).toBe(60);
    });

    it('returns lower priority for due words', () => {
      const progress = makeProgress({
        nextReviewDate: '2026-07-18T00:00:00Z',
      });
      const result = calculateWordPriority(
        'w1',
        progress,
        new Date('2026-07-19')
      );
      expect(result.reason).toBe('due');
      expect(result.priority).toBe(40);
    });

    it('returns new for undefined progress', () => {
      const result = calculateWordPriority('w1', undefined);
      expect(result.reason).toBe('new');
      expect(result.priority).toBe(20);
    });
  });

  describe('prioritizeWords', () => {
    it('sorts words by priority', () => {
      const progressMap: Record<string, VocabularyMenuProgress> = {
        w1: makeProgress({ isWeak: true }),
        w2: makeProgress({ isLeech: true, correctReviews: 1, wrongReviews: 3 }),
        w3: makeProgress({ nextReviewDate: '2026-07-18T00:00:00Z' }),
      };
      const result = prioritizeWords(
        ['w1', 'w2', 'w3'],
        progressMap,
        new Date('2026-07-19')
      );
      expect(result[0].wordId).toBe('w2');
      expect(result[1].wordId).toBe('w1');
      expect(result[2].wordId).toBe('w3');
    });

    it('respects limit parameter', () => {
      const progressMap: Record<string, VocabularyMenuProgress> = {
        w1: makeProgress({ isWeak: true }),
        w2: makeProgress({ isLeech: true, correctReviews: 1, wrongReviews: 3 }),
      };
      const result = prioritizeWords(['w1', 'w2'], progressMap, new Date(), 1);
      expect(result).toHaveLength(1);
    });
  });

  describe('getSessionPriorityLabel', () => {
    it('returns descriptive labels for each reason', () => {
      expect(getSessionPriorityLabel('leech')).toContain('slipping');
      expect(getSessionPriorityLabel('forgotten')).toContain('gap');
      expect(getSessionPriorityLabel('weak')).toContain('fragile');
      expect(getSessionPriorityLabel('due')).toContain('Scheduled');
      expect(getSessionPriorityLabel('new')).toContain('First encounter');
      expect(getSessionPriorityLabel('maintenance')).toContain('Periodic');
    });
  });
});
