import { describe, it, expect } from 'vitest';
import {
  calculateRetention,
  estimateStability,
  generateForgettingCurve,
  getRetentionColor,
  getRetentionLabel,
} from './vocabulary.forgetting-curve';

describe('Forgetting Curve', () => {
  describe('calculateRetention', () => {
    it('returns 100% at day 0', () => {
      expect(calculateRetention(0, 3)).toBe(100);
    });

    it('decreases over time', () => {
      const day1 = calculateRetention(1, 3);
      const day5 = calculateRetention(5, 3);
      expect(day1).toBeGreaterThan(day5);
    });

    it('clamps to 0 for very old reviews', () => {
      expect(calculateRetention(100, 3)).toBe(0);
    });

    it('returns 0 for zero stability', () => {
      expect(calculateRetention(5, 0)).toBe(0);
    });
  });

  describe('estimateStability', () => {
    it('returns default stability for no reviews', () => {
      expect(estimateStability(0, 0, 2.5)).toBe(3);
    });

    it('increases with more correct reviews', () => {
      const low = estimateStability(1, 0, 2.5);
      const high = estimateStability(5, 0, 2.5);
      expect(high).toBeGreaterThan(low);
    });

    it('decreases with more wrong reviews', () => {
      const clean = estimateStability(3, 0, 2.5);
      const withMistakes = estimateStability(3, 3, 2.5);
      expect(withMistakes).toBeLessThan(clean);
    });

    it('never goes below 0.5', () => {
      expect(estimateStability(0, 10, 1.3)).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('generateForgettingCurve', () => {
    it('generates correct number of points', () => {
      const result = generateForgettingCurve('w1', 3, 0, 2.5, 0, 7);
      expect(result.curve).toHaveLength(8);
    });

    it('starts at 100% retention', () => {
      const result = generateForgettingCurve('w1', 3, 0, 2.5, 0, 7);
      expect(result.curve[0].retention).toBe(100);
    });

    it('current retention matches curve at day 0 offset', () => {
      const result = generateForgettingCurve('w1', 3, 0, 2.5, 2, 7);
      expect(result.currentRetention).toBe(result.curve[0].retention);
    });
  });

  describe('getRetentionColor / getRetentionLabel', () => {
    it('returns green for high retention', () => {
      expect(getRetentionColor(85)).toBe('#22c55e');
      expect(getRetentionLabel(85)).toBe('Strong');
    });

    it('returns red for low retention', () => {
      expect(getRetentionColor(10)).toBe('#ef4444');
      expect(getRetentionLabel(10)).toBe('Critical');
    });
  });
});
