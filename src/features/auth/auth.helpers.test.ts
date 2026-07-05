import { describe, expect, it } from 'vitest';
import { getInitials, generateId } from './auth.helpers';

describe('auth helpers', () => {
  describe('getInitials', () => {
    it('returns two initials for full name', () => {
      expect(getInitials('John Smith')).toBe('JS');
    });

    it('returns two initials for multi-word name', () => {
      expect(getInitials('John Michael Smith')).toBe('JS');
    });

    it('returns first two chars for single name', () => {
      expect(getInitials('John')).toBe('JO');
    });

    it('returns ?? for empty string', () => {
      expect(getInitials('')).toBe('??');
    });

    it('handles extra whitespace', () => {
      expect(getInitials('  John   Smith  ')).toBe('JS');
    });
  });

  describe('generateId', () => {
    it('generates id with user_ prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^user_/);
    });

    it('generates unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });
});
