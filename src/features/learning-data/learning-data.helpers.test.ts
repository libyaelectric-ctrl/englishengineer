import { describe, expect, it } from 'vitest';
import {
  getLevelsThrough,
  isCefrAtOrBelow,
  includesNormalized,
  extractCefrFromId,
} from './learning-data.helpers';

describe('learning-data helpers', () => {
  describe('getLevelsThrough', () => {
    it('returns all levels up to and including the given level', () => {
      expect(getLevelsThrough('B2')).toEqual(['A1', 'A2', 'B1', 'B2']);
    });

    it('returns just A1 when given A1', () => {
      expect(getLevelsThrough('A1')).toEqual(['A1']);
    });

    it('returns all levels when given C2', () => {
      expect(getLevelsThrough('C2')).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    });
  });

  describe('isCefrAtOrBelow', () => {
    it('returns true when candidate is below ceiling', () => {
      expect(isCefrAtOrBelow('A1', 'B2')).toBe(true);
    });

    it('returns true when candidate equals ceiling', () => {
      expect(isCefrAtOrBelow('B2', 'B2')).toBe(true);
    });

    it('returns false when candidate is above ceiling', () => {
      expect(isCefrAtOrBelow('C1', 'B2')).toBe(false);
    });
  });

  describe('includesNormalized', () => {
    it('finds case-insensitive match', () => {
      expect(includesNormalized(['Cable', 'TRAY', 'Installation'], 'cable')).toBe(true);
    });

    it('returns false when no match', () => {
      expect(includesNormalized(['Cable', 'Tray'], 'conduit')).toBe(false);
    });

    it('handles whitespace differences', () => {
      expect(includesNormalized(['  hello  '], 'hello')).toBe(true);
    });
  });

  describe('extractCefrFromId', () => {
    it('extracts level from typical id pattern', () => {
      expect(extractCefrFromId('reading_a2_daily_progress')).toBe('A2');
    });

    it('extracts B1 level', () => {
      expect(extractCefrFromId('speaking_b1_inspection')).toBe('B1');
    });

    it('returns null when no level found', () => {
      expect(extractCefrFromId('no_level_here')).toBeNull();
    });

    it('handles uppercase ids', () => {
      expect(extractCefrFromId('WRITING_C1_REPORT')).toBe('C1');
    });
  });
});
