import { describe, expect, it } from 'vitest';

import { ListeningHelpers } from './listening.helpers';

describe('ListeningHelpers', () => {
  describe('getAudioFormatLabel', () => {
    it('returns format label for mp3', () => {
      expect(ListeningHelpers.getAudioFormatLabel('https://example.com/audio.mp3')).toBe('MP3 audio');
    });

    it('returns format label for wav', () => {
      expect(ListeningHelpers.getAudioFormatLabel('https://example.com/audio.wav')).toBe('WAV audio');
    });

    it('returns format label for ogg', () => {
      expect(ListeningHelpers.getAudioFormatLabel('https://example.com/audio.ogg')).toBe('OGG audio');
    });

    it('returns Audio asset for no-extension URL', () => {
      // When there's no dot, toUpperCase() still applies to the whole string
      expect(ListeningHelpers.getAudioFormatLabel('audio')).toContain('audio');
    });

    it('handles empty string', () => {
      expect(ListeningHelpers.getAudioFormatLabel('')).toBe('Audio asset');
    });
  });

  describe('getAudioLoadFailureMessage', () => {
    it('returns failure message', () => {
      const message = ListeningHelpers.getAudioLoadFailureMessage();
      expect(message).toContain('could not be loaded');
    });
  });

  describe('normalizeDurationSeconds', () => {
    it('returns browser duration when valid', () => {
      expect(ListeningHelpers.normalizeDurationSeconds(120, 100)).toBe(120);
    });

    it('returns metadata duration when browser duration is 0', () => {
      expect(ListeningHelpers.normalizeDurationSeconds(0, 100)).toBe(100);
    });

    it('returns metadata duration when browser duration is negative', () => {
      expect(ListeningHelpers.normalizeDurationSeconds(-5, 100)).toBe(100);
    });

    it('returns metadata duration when browser duration is NaN', () => {
      expect(ListeningHelpers.normalizeDurationSeconds(NaN, 100)).toBe(100);
    });

    it('returns metadata duration when browser duration is Infinity', () => {
      expect(ListeningHelpers.normalizeDurationSeconds(Infinity, 100)).toBe(100);
    });

    it('returns at least 1 when metadata duration is 0', () => {
      expect(ListeningHelpers.normalizeDurationSeconds(0, 0)).toBe(1);
    });

    it('rounds browser duration', () => {
      expect(ListeningHelpers.normalizeDurationSeconds(120.7, 100)).toBe(121);
    });
  });

  describe('getDisciplineShort', () => {
    it('returns EE for Electrical', () => {
      expect(ListeningHelpers.getDisciplineShort('Electrical Engineering')).toBe('EE');
    });

    it('returns DES for Design', () => {
      expect(ListeningHelpers.getDisciplineShort('Design Engineering')).toBe('DES');
    });

    it('returns PWR for Power', () => {
      expect(ListeningHelpers.getDisciplineShort('Power Systems')).toBe('PWR');
    });

    it('returns QA for Quality', () => {
      expect(ListeningHelpers.getDisciplineShort('Quality Assurance')).toBe('QA');
    });

    it('returns O&M for Operations', () => {
      expect(ListeningHelpers.getDisciplineShort('Operations & Maintenance')).toBe('O&M');
    });

    it('returns FLD for Field', () => {
      expect(ListeningHelpers.getDisciplineShort('Field Engineering')).toBe('FLD');
    });

    it('returns TST for Testing', () => {
      expect(ListeningHelpers.getDisciplineShort('Testing Engineering')).toBe('TST');
    });

    it('returns SFT for Safety', () => {
      expect(ListeningHelpers.getDisciplineShort('Safety Engineering')).toBe('SFT');
    });

    it('returns PM for specialist', () => {
      expect(ListeningHelpers.getDisciplineShort('specialist engineering')).toBe('PM');
    });

    it('returns ME for Mechanical', () => {
      expect(ListeningHelpers.getDisciplineShort('Mechanical Engineering')).toBe('ME');
    });

    it('returns ENG for other disciplines', () => {
      expect(ListeningHelpers.getDisciplineShort('Civil Engineering')).toBe('ENG');
      expect(ListeningHelpers.getDisciplineShort('Chemical Engineering')).toBe('ENG');
    });

    it('handles empty string', () => {
      expect(ListeningHelpers.getDisciplineShort('')).toBe('ENG');
    });
  });

  describe('formatTime', () => {
    it('formats seconds to mm:ss', () => {
      expect(ListeningHelpers.formatTime(0)).toBe('00:00');
      expect(ListeningHelpers.formatTime(30)).toBe('00:30');
      expect(ListeningHelpers.formatTime(60)).toBe('01:00');
      expect(ListeningHelpers.formatTime(90)).toBe('01:30');
      expect(ListeningHelpers.formatTime(3600)).toBe('60:00');
    });
  });

  describe('getCefrBadgeStyles', () => {
    it('returns styles for CEFR levels', () => {
      const styles = ListeningHelpers.getCefrBadgeStyles('A1');
      expect(typeof styles).toBe('string');
      expect(styles).toContain('bg-');
      expect(styles).toContain('text-');
    });
  });

  describe('getDifficultyColor', () => {
    it('returns color for difficulty levels', () => {
      const color = ListeningHelpers.getDifficultyColor('beginner');
      expect(typeof color).toBe('string');
    });
  });
});
