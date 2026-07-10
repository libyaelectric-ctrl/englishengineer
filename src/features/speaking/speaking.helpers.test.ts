import { describe, expect, it } from 'vitest';
import {
  normalizeSpeechText,
  countWords,
  countSentences,
  countFillerWords,
  calculateWordsPerMinute,
  keywordMatchRatio,
  formatSpeakingDifficulty,
} from './speaking.helpers';

describe('speaking helpers', () => {
  describe('normalizeSpeechText', () => {
    it('lowercases and strips punctuation', () => {
      expect(normalizeSpeechText('Hello, World!')).toBe('hello world');
    });

    it('collapses multiple spaces', () => {
      expect(normalizeSpeechText('a   b  c')).toBe('a b c');
    });

    it('trims whitespace', () => {
      expect(normalizeSpeechText('  hello  ')).toBe('hello');
    });

    it('handles empty string', () => {
      expect(normalizeSpeechText('')).toBe('');
    });
  });

  describe('countWords', () => {
    it('counts words in normal text', () => {
      expect(countWords('The cable tray is installed')).toBe(5);
    });

    it('returns 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });

    it('ignores punctuation when counting', () => {
      expect(countWords('Hello, world! How are you?')).toBe(5);
    });
  });

  describe('countSentences', () => {
    it('counts sentences ending with period', () => {
      expect(countSentences('First sentence. Second sentence.')).toBe(2);
    });

    it('counts sentences ending with exclamation', () => {
      expect(countSentences('Hello! How are you?')).toBe(2);
    });

    it('counts trailing sentence without punctuation', () => {
      expect(countSentences('One. Two')).toBe(2);
    });

    it('returns 0 for empty string', () => {
      expect(countSentences('')).toBe(0);
    });
  });

  describe('countFillerWords', () => {
    it('detects filler words', () => {
      expect(countFillerWords('I think um the cable is broken')).toBe(1);
    });

    it('counts multiple fillers', () => {
      expect(countFillerWords('um basically like')).toBe(3);
    });

    it('returns 0 when no fillers present', () => {
      expect(countFillerWords('The installation is complete')).toBe(0);
    });
  });

  describe('calculateWordsPerMinute', () => {
    it('calculates WPM from word count and seconds', () => {
      const result = calculateWordsPerMinute(100, 60);
      expect(result.value).toBe(100);
      expect(result.isEstimated).toBe(false);
    });

    it('estimates WPM when recordingSeconds is 0', () => {
      const result = calculateWordsPerMinute(100, 0);
      expect(result.isEstimated).toBe(true);
      expect(result.value).toBeGreaterThan(0);
    });

    it('returns 0 for zero words', () => {
      const result = calculateWordsPerMinute(0, 60);
      expect(result.value).toBe(0);
    });

    it('caps WPM at 240', () => {
      const result = calculateWordsPerMinute(500, 60);
      expect(result.value).toBe(240);
    });
  });

  describe('keywordMatchRatio', () => {
    it('returns 1 for empty keywords', () => {
      expect(keywordMatchRatio('any text', [])).toBe(1);
    });

    it('returns 1 when all keywords match', () => {
      expect(
        keywordMatchRatio('cable tray installation', ['cable', 'tray'])
      ).toBe(1);
    });

    it('returns partial ratio', () => {
      expect(keywordMatchRatio('cable installation', ['cable', 'tray'])).toBe(
        0.5
      );
    });

    it('returns 0 when no keywords match', () => {
      expect(keywordMatchRatio('hello world', ['cable', 'tray'])).toBe(0);
    });
  });

  describe('formatSpeakingDifficulty', () => {
    it('uppercases difficulty', () => {
      expect(formatSpeakingDifficulty('intermediate')).toBe('INTERMEDIATE');
    });
  });
});
