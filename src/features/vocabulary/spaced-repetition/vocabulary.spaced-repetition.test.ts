import { describe, it, expect } from 'vitest';
import {
  createInitialReviewState,
  updateSm2ReviewState,
} from './vocabulary.spaced-repetition';

describe('vocabulary.spaced-repetition', () => {
  describe('createInitialReviewState', () => {
    it('creates initial state with correct defaults', () => {
      const state = createInitialReviewState('word-1');
      expect(state.wordId).toBe('word-1');
      expect(state.interval).toBe(0);
      expect(state.easeFactor).toBe(2.5);
      expect(state.repetitions).toBe(0);
      expect(state.nextReview).toBeDefined();
      expect(state.lastReview).toBeNull();
    });

    it('creates unique states for different words', () => {
      const state1 = createInitialReviewState('word-1');
      const state2 = createInitialReviewState('word-2');
      expect(state1.wordId).toBe('word-1');
      expect(state2.wordId).toBe('word-2');
    });
  });

  describe('updateSm2ReviewState', () => {
    it('resets repetitions when quality < 3 (failed review)', () => {
      const initial = createInitialReviewState('word-1');
      initial.repetitions = 5;
      initial.interval = 30;

      const updated = updateSm2ReviewState(initial, 2);
      expect(updated.repetitions).toBe(0);
      expect(updated.interval).toBe(1);
    });

    it('increments repetitions when quality >= 3', () => {
      const initial = createInitialReviewState('word-1');
      const updated = updateSm2ReviewState(initial, 4);
      expect(updated.repetitions).toBe(1);
      expect(updated.interval).toBe(1);
    });

    it('sets interval to 6 on second repetition', () => {
      const initial = createInitialReviewState('word-1');
      initial.repetitions = 1;
      initial.interval = 1;

      const updated = updateSm2ReviewState(initial, 4);
      expect(updated.repetitions).toBe(2);
      expect(updated.interval).toBe(6);
    });

    it('increases interval by easeFactor after 2+ repetitions', () => {
      const initial = createInitialReviewState('word-1');
      initial.repetitions = 3;
      initial.interval = 10;
      initial.easeFactor = 2.5;

      const updated = updateSm2ReviewState(initial, 4);
      expect(updated.repetitions).toBe(4);
      expect(updated.interval).toBe(Math.round(10 * updated.easeFactor));
    });

    it('clamps quality to 0-5 range', () => {
      const initial = createInitialReviewState('word-1');
      const updated = updateSm2ReviewState(initial, 10);
      expect(updated.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('decreases easeFactor on low quality', () => {
      const initial = createInitialReviewState('word-1');
      initial.easeFactor = 2.5;

      const updated = updateSm2ReviewState(initial, 1);
      expect(updated.easeFactor).toBeLessThan(2.5);
    });

    it('never lets easeFactor go below 1.3', () => {
      let state = createInitialReviewState('word-1');
      for (let i = 0; i < 20; i++) {
        state = updateSm2ReviewState(state, 0);
      }
      expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('updates lastReview timestamp', () => {
      const initial = createInitialReviewState('word-1');
      const now = new Date('2026-07-10T12:00:00Z');
      const updated = updateSm2ReviewState(initial, 4, now);
      expect(updated.lastReview).toBe(now.toISOString());
    });

    it('calculates nextReview correctly for first successful review', () => {
      const initial = createInitialReviewState('word-1');
      const now = new Date('2026-07-10T12:00:00Z');
      const updated = updateSm2ReviewState(initial, 4, now);
      const expected = new Date('2026-07-11T12:00:00Z');
      expect(new Date(updated.nextReview).toDateString()).toBe(
        expected.toDateString()
      );
    });

    it('calculates nextReview correctly for second successful review', () => {
      const initial = createInitialReviewState('word-1');
      initial.repetitions = 1;
      initial.interval = 1;
      const now = new Date('2026-07-10T12:00:00Z');
      const updated = updateSm2ReviewState(initial, 4, now);
      const expected = new Date('2026-07-16T12:00:00Z');
      expect(new Date(updated.nextReview).toDateString()).toBe(
        expected.toDateString()
      );
    });

    it('preserves wordId through updates', () => {
      const initial = createInitialReviewState('word-42');
      const updated = updateSm2ReviewState(initial, 3);
      expect(updated.wordId).toBe('word-42');
    });

    it('handles quality = 0 (complete blackout)', () => {
      const initial = createInitialReviewState('word-1');
      initial.repetitions = 5;
      initial.interval = 100;

      const updated = updateSm2ReviewState(initial, 0);
      expect(updated.repetitions).toBe(0);
      expect(updated.interval).toBe(1);
    });

    it('handles quality = 5 (perfect recall)', () => {
      const initial = createInitialReviewState('word-1');
      initial.repetitions = 2;
      initial.interval = 6;

      const updated = updateSm2ReviewState(initial, 5);
      expect(updated.repetitions).toBe(3);
      expect(updated.interval).toBeGreaterThan(6);
    });
  });
});
