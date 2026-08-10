import { describe, expect, it } from 'vitest';

import { MAX_HEARTS, loseHeart, msUntilRefill, refillHeartsIfDue } from './learning.hearts';

describe('learning.hearts', () => {
  const now = new Date('2026-08-11T12:00:00.000Z');

  describe('loseHeart', () => {
    it('decrements hearts by 1 and leaves depletedAt untouched while above 0', () => {
      const result = loseHeart(3, null, now);
      expect(result).toEqual({ hearts: 2, depletedAt: null });
    });

    it('stamps depletedAt with the current time the moment hearts reach 0', () => {
      const result = loseHeart(1, null, now);
      expect(result).toEqual({ hearts: 0, depletedAt: now.toISOString() });
    });

    it('is a no-op (never goes negative, never re-stamps) once already at 0', () => {
      const depletedAt = '2026-08-10T12:00:00.000Z';
      const result = loseHeart(0, depletedAt, now);
      expect(result).toEqual({ hearts: 0, depletedAt });
    });
  });

  describe('refillHeartsIfDue', () => {
    it('returns unchanged when hearts are not depleted', () => {
      const result = refillHeartsIfDue(3, null, now);
      expect(result).toEqual({ hearts: 3, depletedAt: null });
    });

    it('returns unchanged when less than 24h have passed since depletion', () => {
      const depletedAt = new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString();
      const result = refillHeartsIfDue(0, depletedAt, now);
      expect(result).toEqual({ hearts: 0, depletedAt });
    });

    it('refills to MAX_HEARTS and clears depletedAt once 24h have passed', () => {
      const depletedAt = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
      const result = refillHeartsIfDue(0, depletedAt, now);
      expect(result).toEqual({ hearts: MAX_HEARTS, depletedAt: null });
    });

    it('refills exactly at the 24h boundary', () => {
      const depletedAt = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const result = refillHeartsIfDue(0, depletedAt, now);
      expect(result).toEqual({ hearts: MAX_HEARTS, depletedAt: null });
    });
  });

  describe('msUntilRefill', () => {
    it('returns 0 when not depleted', () => {
      expect(msUntilRefill(null, now)).toBe(0);
    });

    it('returns the remaining milliseconds until the 24h window elapses', () => {
      const depletedAt = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1h ago
      expect(msUntilRefill(depletedAt, now)).toBe(23 * 60 * 60 * 1000);
    });

    it('returns 0 (never negative) once the window has already elapsed', () => {
      const depletedAt = new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString(); // 30h ago
      expect(msUntilRefill(depletedAt, now)).toBe(0);
    });
  });
});
