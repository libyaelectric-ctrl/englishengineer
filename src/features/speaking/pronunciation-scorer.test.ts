import { describe, it, expect } from 'vitest';
import { PronunciationScorer } from './pronunciation-scorer';

describe('PronunciationScorer', () => {
  const targetWords = [
    { word: 'coordination', ipa: '/koʊˌɔːrdɪˈneɪʃən/' },
    { word: 'inspection', ipa: '/ɪnˈspɛkʃən/' },
    { word: 'compliance', ipa: '/kəmˈplaɪəns/' },
  ];

  describe('analyze', () => {
    it('gives perfect score for exact matches', () => {
      const result = PronunciationScorer.analyze(
        targetWords,
        'coordination inspection compliance'
      );
      expect(result.overallScore).toBe(100);
      expect(result.accentStrength).toBe('native');
      expect(result.accurateWordCount).toBe(3);
      expect(result.totalTargetWords).toBe(3);
    });

    it('gives high score for near matches', () => {
      const result = PronunciationScorer.analyze(
        targetWords,
        'coordination inspection compliance'
      );
      expect(result.overallScore).toBeGreaterThanOrEqual(80);
    });

    it('penalizes completely missing words', () => {
      const result = PronunciationScorer.analyze(targetWords, 'hello world');
      expect(result.overallScore).toBe(0);
      expect(result.accentStrength).toBe('weak');
      expect(result.accurateWordCount).toBe(0);
    });

    it('handles partial matches with similarity scoring', () => {
      const result = PronunciationScorer.analyze(
        [{ word: 'electrical', ipa: '/ɪˈlɛktrɪkəl/' }],
        'electrikl'
      );
      expect(result.wordAnalyses[0].similarity).toBeGreaterThan(0.5);
      expect(result.wordAnalyses[0].isAccurate).toBe(true);
    });

    it('handles empty recognized text', () => {
      const result = PronunciationScorer.analyze(targetWords, '');
      expect(result.overallScore).toBe(0);
      expect(result.wordAnalyses).toHaveLength(3);
    });

    it('handles empty target words', () => {
      const result = PronunciationScorer.analyze([], 'some text');
      expect(result.overallScore).toBe(100);
      expect(result.totalTargetWords).toBe(0);
    });

    it('generates recommendations for inaccurate words', () => {
      const result = PronunciationScorer.analyze(
        targetWords,
        'hello world test'
      );
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('generates positive feedback for good pronunciation', () => {
      const result = PronunciationScorer.analyze(
        targetWords,
        'coordination inspection compliance'
      );
      expect(result.feedback).toContain('clear');
    });

    it('generates improvement feedback for poor pronunciation', () => {
      const result = PronunciationScorer.analyze(targetWords, 'xyz abc def');
      expect(result.feedback).toContain('practice');
    });

    it('classifies accent strength correctly', () => {
      const perfect = PronunciationScorer.analyze(
        targetWords,
        'coordination inspection compliance'
      );
      expect(perfect.accentStrength).toBe('native');

      const poor = PronunciationScorer.analyze(targetWords, 'xxx yyy zzz');
      expect(poor.accentStrength).toBe('weak');
    });

    it('calculates accurate word count correctly', () => {
      const result = PronunciationScorer.analyze(
        targetWords,
        'coordination xyz compliance'
      );
      expect(result.accurateWordCount).toBe(2);
      expect(result.totalTargetWords).toBe(3);
    });
  });
});
