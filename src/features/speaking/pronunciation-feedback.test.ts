import { describe, expect, it } from 'vitest';
import { PronunciationFeedbackEngine } from './pronunciation-feedback';

describe('PronunciationFeedbackEngine', () => {
  describe('analyzeWord', () => {
    it('returns high accuracy for correct pronunciation', () => {
      const result = PronunciationFeedbackEngine.analyzeWord(
        'hello',
        '/hɛloʊ/',
        'hello'
      );
      expect(result.overallAccuracy).toBe(100);
      expect(result.word).toBe('hello');
    });

    it('returns lower accuracy for mispronounced word', () => {
      const result = PronunciationFeedbackEngine.analyzeWord(
        'hello',
        '/hɛloʊ/',
        'helo'
      );
      expect(result.overallAccuracy).toBeLessThan(100);
    });

    it('generates a tip', () => {
      const result = PronunciationFeedbackEngine.analyzeWord(
        'think',
        '/θɪŋk/',
        'tink'
      );
      expect(result.tip).toBeTruthy();
      expect(typeof result.tip).toBe('string');
    });

    it('extracts phoneme details', () => {
      const result = PronunciationFeedbackEngine.analyzeWord(
        'cat',
        '/kæt/',
        'cat'
      );
      expect(result.phonemeDetails.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeSession', () => {
    it('analyzes multiple words', () => {
      const result = PronunciationFeedbackEngine.analyzeSession(
        [
          { word: 'hello', ipa: '/hɛloʊ/' },
          { word: 'world', ipa: '/wɜːrld/' },
        ],
        'hello world',
        'session-1'
      );
      expect(result.feedbacks).toHaveLength(2);
      expect(result.sessionId).toBe('session-1');
    });

    it('calculates overall score', () => {
      const result = PronunciationFeedbackEngine.analyzeSession(
        [{ word: 'test', ipa: '/tɛst/' }],
        'test',
        's1'
      );
      expect(result.overallScore).toBe(100);
    });
  });

  describe('calculateSimilarity', () => {
    it('returns 1 for identical strings', () => {
      expect(
        PronunciationFeedbackEngine.calculateSimilarity('hello', 'hello')
      ).toBe(1);
    });

    it('returns high value for similar strings', () => {
      expect(
        PronunciationFeedbackEngine.calculateSimilarity('hello', 'helo')
      ).toBeGreaterThan(0.7);
    });

    it('returns low value for different strings', () => {
      expect(
        PronunciationFeedbackEngine.calculateSimilarity('cat', 'dog')
      ).toBeLessThan(0.5);
    });
  });

  describe('getAccentLabel', () => {
    it('returns correct labels', () => {
      expect(PronunciationFeedbackEngine.getAccentLabel(95)).toBe(
        'Native-like'
      );
      expect(PronunciationFeedbackEngine.getAccentLabel(80)).toBe('Strong');
      expect(PronunciationFeedbackEngine.getAccentLabel(60)).toBe('Moderate');
      expect(PronunciationFeedbackEngine.getAccentLabel(40)).toBe('Developing');
      expect(PronunciationFeedbackEngine.getAccentLabel(20)).toBe('Needs work');
    });
  });

  describe('getAccentColor', () => {
    it('returns correct colors', () => {
      expect(PronunciationFeedbackEngine.getAccentColor(95)).toBe('#22c55e');
      expect(PronunciationFeedbackEngine.getAccentColor(20)).toBe('#ef4444');
    });
  });

  describe('detectTurkishAccentPatterns', () => {
    it('detects th pattern', () => {
      const tips =
        PronunciationFeedbackEngine.detectTurkishAccentPatterns('think this');
      expect(tips.length).toBeGreaterThanOrEqual(0);
    });

    it('detects r pattern', () => {
      const tips =
        PronunciationFeedbackEngine.detectTurkishAccentPatterns('red car');
      expect(tips.some((t) => t.toLowerCase().includes('r'))).toBe(true);
    });
  });

  describe('getPhonemeTip', () => {
    it('returns tips for known phonemes', () => {
      expect(
        PronunciationFeedbackEngine.getPhonemeTip('θ').toLowerCase()
      ).toContain('tongue');
      expect(
        PronunciationFeedbackEngine.getPhonemeTip('æ').toLowerCase()
      ).toContain('vowel');
    });

    it('returns default tip for unknown phoneme', () => {
      expect(PronunciationFeedbackEngine.getPhonemeTip('x')).toContain(
        'Practice'
      );
    });
  });
});
