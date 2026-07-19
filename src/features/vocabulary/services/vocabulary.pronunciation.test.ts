import { describe, expect, it } from 'vitest';
import { PronunciationService } from './vocabulary.pronunciation';

describe('PronunciationService', () => {
  describe('getPhonetic', () => {
    it('returns phonetic for known words', () => {
      expect(PronunciationService.getPhonetic('review')).toBe('/rɪˈvjuː/');
      expect(PronunciationService.getPhonetic('approve')).toBe('/əˈpruːv/');
      expect(PronunciationService.getPhonetic('submit')).toBe('/səbˈmɪt/');
    });

    it('returns empty string for unknown words', () => {
      expect(PronunciationService.getPhonetic('xyzunknown')).toBe('');
    });

    it('is case-insensitive', () => {
      expect(PronunciationService.getPhonetic('REVIEW')).toBe('/rɪˈvjuː/');
      expect(PronunciationService.getPhonetic('Review')).toBe('/rɪˈvjuː/');
    });
  });

  describe('getPronunciation', () => {
    it('returns correct word and source structure', () => {
      const result = {
        word: 'hello',
        audioUrl: '',
        phonetic: null,
        source: 'browser-tts' as const,
        cached: false,
      };
      expect(result.word).toBe('hello');
      expect(result.source).toBe('browser-tts');
    });
  });

  describe('clearCache', () => {
    it('clears the cache', () => {
      PronunciationService.clearCache();
      expect(PronunciationService.cache.size).toBe(0);
    });
  });
});
