import { describe, expect, it } from 'vitest';
import { SentenceGeneratorService } from './vocabulary.sentences';

describe('SentenceGeneratorService', () => {
  describe('generateForWord', () => {
    it('generates sentences for a word', () => {
      const sentences = SentenceGeneratorService.generateForWord(
        'review',
        'verb',
        'gözden geçirmek',
        3
      );
      expect(sentences.length).toBe(3);
      expect(sentences[0].word).toBe('review');
      expect(sentences[0].sentence).toContain('review');
    });

    it('generates different contexts', () => {
      const sentences = SentenceGeneratorService.generateForWord(
        'approve',
        'verb',
        'onaylamak',
        3
      );
      const contexts = sentences.map((s) => s.context);
      expect(new Set(contexts).size).toBe(3);
    });

    it('generates translations', () => {
      const sentences = SentenceGeneratorService.generateForWord(
        'submit',
        'verb',
        'sunmak',
        2
      );
      expect(sentences[0].translation).toBeTruthy();
    });

    it('assigns difficulty levels', () => {
      const sentences = SentenceGeneratorService.generateForWord(
        'analyze',
        'verb',
        'analiz etmek',
        3
      );
      expect(sentences[0].difficulty).toBe('beginner');
      expect(sentences[1].difficulty).toBe('intermediate');
      expect(sentences[2].difficulty).toBe('advanced');
    });
  });

  describe('generateBatch', () => {
    it('generates sentences for multiple words', () => {
      const results = SentenceGeneratorService.generateBatch([
        { word: 'review', partOfSpeech: 'verb', meaning: 'gözden geçirmek' },
        { word: 'submit', partOfSpeech: 'verb', meaning: 'sunmak' },
      ]);
      expect(results).toHaveLength(2);
      expect(results[0].word).toBe('review');
      expect(results[1].word).toBe('submit');
    });
  });

  describe('formatForDisplay', () => {
    it('formats sentences for display', () => {
      const result = SentenceGeneratorService.generateBatch([
        { word: 'test', partOfSpeech: 'verb', meaning: 'test etmek' },
      ]);
      const formatted = SentenceGeneratorService.formatForDisplay(result[0]);
      expect(formatted).toContain('[workplace]');
      expect(formatted).toContain('test');
    });
  });
});
