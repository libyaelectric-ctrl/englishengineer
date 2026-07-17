import { describe, it, expect } from 'vitest';
import {
  getDueTodayWords,
  getUpcomingReviews,
  getReviewStats,
} from './vocabulary-due-today';
import type { VocabularyReviewState } from '../types/vocabulary.types';

const makeReview = (
  overrides: Partial<VocabularyReviewState> = {}
): VocabularyReviewState => ({
  wordId: 'test-word',
  interval: 1,
  easeFactor: 2.5,
  repetitions: 0,
  nextReview: new Date().toISOString(),
  lastReview: null,
  ...overrides,
});

describe('vocabulary-due-today', () => {
  const now = new Date('2026-07-10T12:00:00Z');

  describe('getDueTodayWords', () => {
    it('returns words with nextReview in the past', () => {
      const states = {
        'word-1': makeReview({
          wordId: 'word-1',
          nextReview: '2026-07-09T10:00:00Z',
        }),
        'word-2': makeReview({
          wordId: 'word-2',
          nextReview: '2026-07-11T10:00:00Z',
        }),
      };
      const due = getDueTodayWords(states, now);
      expect(due).toHaveLength(1);
      expect(due[0].wordId).toBe('word-1');
    });

    it('returns words scheduled for today', () => {
      const states = {
        'word-1': makeReview({
          wordId: 'word-1',
          nextReview: '2026-07-10T08:00:00Z',
        }),
      };
      const due = getDueTodayWords(states, now);
      expect(due).toHaveLength(1);
    });

    it('returns empty array when nothing is due', () => {
      const states = {
        'word-1': makeReview({
          wordId: 'word-1',
          nextReview: '2026-07-20T10:00:00Z',
        }),
      };
      const due = getDueTodayWords(states, now);
      expect(due).toHaveLength(0);
    });

    it('sorts by days overdue (most overdue first)', () => {
      const states = {
        'word-1': makeReview({
          wordId: 'word-1',
          nextReview: '2026-07-08T10:00:00Z',
        }),
        'word-2': makeReview({
          wordId: 'word-2',
          nextReview: '2026-07-05T10:00:00Z',
        }),
        'word-3': makeReview({
          wordId: 'word-3',
          nextReview: '2026-07-09T10:00:00Z',
        }),
      };
      const due = getDueTodayWords(states, now);
      expect(due[0].wordId).toBe('word-2');
      expect(due[1].wordId).toBe('word-1');
      expect(due[2].wordId).toBe('word-3');
    });

    it('handles empty states', () => {
      const due = getDueTodayWords({}, now);
      expect(due).toHaveLength(0);
    });
  });

  describe('getUpcomingReviews', () => {
    it('returns words due within the next N days', () => {
      const states = {
        'word-1': makeReview({
          wordId: 'word-1',
          nextReview: '2026-07-12T10:00:00Z',
        }),
        'word-2': makeReview({
          wordId: 'word-2',
          nextReview: '2026-07-20T10:00:00Z',
        }),
      };
      const upcoming = getUpcomingReviews(states, 7, now);
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].wordId).toBe('word-1');
    });

    it('does not include overdue words', () => {
      const states = {
        'word-1': makeReview({
          wordId: 'word-1',
          nextReview: '2026-07-05T10:00:00Z',
        }),
      };
      const upcoming = getUpcomingReviews(states, 7, now);
      expect(upcoming).toHaveLength(0);
    });
  });

  describe('getReviewStats', () => {
    it('calculates correct stats', () => {
      const futureDate = '2099-01-01T00:00:00Z';
      const states = {
        'word-1': {
          wordId: 'word-1',
          repetitions: 6,
          interval: 45,
          easeFactor: 2.5,
          nextReview: futureDate,
          lastReview: null,
        },
        'word-2': {
          wordId: 'word-2',
          repetitions: 2,
          interval: 5,
          easeFactor: 2.5,
          nextReview: futureDate,
          lastReview: null,
        },
        'word-3': {
          wordId: 'word-3',
          repetitions: 0,
          interval: 0,
          easeFactor: 2.5,
          nextReview: futureDate,
          lastReview: null,
        },
      };
      const stats = getReviewStats(states, now);
      expect(stats.total).toBe(3);
      expect(stats.mastered).toBe(1);
      expect(stats.learning).toBe(1);
      expect(stats.newWords).toBe(1);
      expect(stats.dueToday).toBe(0);
    });

    it('handles empty states', () => {
      const stats = getReviewStats({}, now);
      expect(stats.total).toBe(0);
      expect(stats.averageEaseFactor).toBe(0);
    });
  });
});
