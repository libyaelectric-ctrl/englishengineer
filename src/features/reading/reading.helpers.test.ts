import { describe, expect, it } from 'vitest';

import { ReadingHelpers } from './reading.helpers';

describe('ReadingHelpers', () => {
  describe('getDisciplineShort', () => {
    it('returns EE for Electrical', () => {
      expect(ReadingHelpers.getDisciplineShort('Electrical Engineering')).toBe('EE');
      expect(ReadingHelpers.getDisciplineShort('Power Electrical')).toBe('EE');
    });

    it('returns SE for Systems', () => {
      expect(ReadingHelpers.getDisciplineShort('Systems Engineering')).toBe('SE');
      expect(ReadingHelpers.getDisciplineShort('Computer Systems')).toBe('SE');
    });

    it('returns ENG for other disciplines', () => {
      expect(ReadingHelpers.getDisciplineShort('Civil Engineering')).toBe('ENG');
      expect(ReadingHelpers.getDisciplineShort('Mechanical Engineering')).toBe('ENG');
      expect(ReadingHelpers.getDisciplineShort('Chemical Engineering')).toBe('ENG');
    });

    it('handles empty string', () => {
      expect(ReadingHelpers.getDisciplineShort('')).toBe('ENG');
    });
  });

  describe('formatTime', () => {
    it('formats seconds to mm:ss', () => {
      expect(ReadingHelpers.formatTime(0)).toBe('00:00');
      expect(ReadingHelpers.formatTime(30)).toBe('00:30');
      expect(ReadingHelpers.formatTime(60)).toBe('01:00');
      expect(ReadingHelpers.formatTime(90)).toBe('01:30');
      expect(ReadingHelpers.formatTime(3600)).toBe('60:00');
    });
  });

  describe('getCefrBadgeStyles', () => {
    it('returns styles for CEFR levels', () => {
      const styles = ReadingHelpers.getCefrBadgeStyles('A1');
      expect(typeof styles).toBe('string');
      expect(styles).toContain('bg-');
      expect(styles).toContain('text-');
    });
  });

  describe('getDifficultyColor', () => {
    it('returns color for difficulty levels', () => {
      const color = ReadingHelpers.getDifficultyColor('beginner');
      expect(typeof color).toBe('string');
    });
  });
});
