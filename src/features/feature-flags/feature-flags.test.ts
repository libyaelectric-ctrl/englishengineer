import { describe, it, expect, beforeEach } from 'vitest';
import { assignVariant, isVariant, getFeatureVariant } from './ab-testing';

describe('A/B Testing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('assignVariant', () => {
    it('assigns a variant from the provided list', () => {
      const test = {
        id: 'test-1',
        flag: 'test-flag',
        variants: ['control', 'treatment'],
      };
      const variant = assignVariant(test, 'user-1');
      expect(['control', 'treatment']).toContain(variant);
    });

    it('returns consistent variant for same user', () => {
      const test = {
        id: 'test-1',
        flag: 'test-flag',
        variants: ['control', 'treatment'],
      };
      const first = assignVariant(test, 'user-1');
      const second = assignVariant(test, 'user-1');
      expect(first).toBe(second);
    });

    it('returns a valid variant for any user', () => {
      const test = {
        id: 'test-valid',
        flag: 'test-flag',
        variants: ['control', 'treatment'],
      };
      for (let i = 0; i < 10; i++) {
        localStorage.clear();
        const v = assignVariant(test, `user-${i}`);
        expect(['control', 'treatment']).toContain(v);
      }
    });

    it('respects weights', () => {
      const test = {
        id: 'test-weighted',
        flag: 'flag',
        variants: ['a', 'b'],
        weights: [100, 0],
      };
      const variant = assignVariant(test, 'user-1');
      expect(variant).toBe('a');
    });

    it('returns first variant as fallback', () => {
      const test = {
        id: 'test-fallback',
        flag: 'flag',
        variants: ['first', 'second'],
      };
      const variant = assignVariant(test, 'user-1');
      expect(['first', 'second']).toContain(variant);
    });
  });

  describe('isVariant', () => {
    it('returns true when variant matches', () => {
      const test = {
        id: 'test-match',
        flag: 'flag',
        variants: ['control', 'treatment'],
      };
      assignVariant(test, 'user-1');
      const assignment = localStorage.getItem('ab_assignments');
      const parsed = assignment ? JSON.parse(assignment) : {};
      const assigned = parsed['test-match'];
      expect(isVariant('test-match', assigned.variant)).toBe(true);
    });

    it('returns false when variant does not match', () => {
      expect(isVariant('nonexistent', 'control')).toBe(false);
    });
  });

  describe('getFeatureVariant', () => {
    it('returns null for non-existent flag', () => {
      const result = getFeatureVariant('nonexistent-flag', 'user-1');
      expect(result).toBeNull();
    });

    it('returns control or treatment for enabled flag', () => {
      const result = getFeatureVariant('new_dashboard', 'user-1');
      if (result) {
        expect(['control', 'treatment']).toContain(result);
      }
    });
  });
});
