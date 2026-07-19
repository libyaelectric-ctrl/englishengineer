import { describe, expect, it } from 'vitest';
import { VocabularyCsvService, type CsvWord } from './vocabulary.csv';

const sampleWords: CsvWord[] = [
  {
    term: 'review',
    turkishMeaning: 'gözden geçirmek',
    cefrLevel: 'B1',
    domain: 'professional',
    exampleSentence: 'Please review the document.',
  },
  {
    term: 'approve',
    turkishMeaning: 'onaylamak',
    cefrLevel: 'B1',
    domain: 'professional',
    exampleSentence: 'The manager approved the request.',
  },
];

describe('VocabularyCsvService', () => {
  describe('exportToCsv', () => {
    it('generates valid CSV', () => {
      const csv = VocabularyCsvService.exportToCsv(sampleWords);
      expect(csv).toContain('term,turkishMeaning');
      expect(csv).toContain('"review"');
      expect(csv).toContain('"gözden geçirmek"');
    });

    it('handles commas in values', () => {
      const words: CsvWord[] = [
        {
          term: 'test',
          turkishMeaning: 'test, kontrol',
          cefrLevel: 'A1',
          domain: 'general',
          exampleSentence: '',
        },
      ];
      const csv = VocabularyCsvService.exportToCsv(words);
      expect(csv).toContain('"test, kontrol"');
    });

    it('handles quotes in values', () => {
      const words: CsvWord[] = [
        {
          term: 'test',
          turkishMeaning: 'say "hello"',
          cefrLevel: 'A1',
          domain: 'general',
          exampleSentence: '',
        },
      ];
      const csv = VocabularyCsvService.exportToCsv(words);
      expect(csv).toContain('"say ""hello"""');
    });
  });

  describe('parseCsv', () => {
    it('parses valid CSV', () => {
      const csv = VocabularyCsvService.exportToCsv(sampleWords);
      const parsed = VocabularyCsvService.parseCsv(csv);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].term).toBe('review');
      expect(parsed[1].term).toBe('approve');
    });

    it('returns empty for empty input', () => {
      expect(VocabularyCsvService.parseCsv('')).toEqual([]);
    });

    it('handles quoted values with commas', () => {
      const csv =
        'term,turkishMeaning,cefrLevel,domain,exampleSentence\n"test","test, kontrol","A1","general",""';
      const parsed = VocabularyCsvService.parseCsv(csv);
      expect(parsed[0].turkishMeaning).toBe('test, kontrol');
    });
  });

  describe('validateImport', () => {
    it('validates correct words', () => {
      const result = VocabularyCsvService.validateImport(sampleWords);
      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects empty terms', () => {
      const words: CsvWord[] = [
        {
          term: '',
          turkishMeaning: 'test',
          cefrLevel: 'A1',
          domain: 'general',
          exampleSentence: '',
        },
      ];
      const result = VocabularyCsvService.validateImport(words);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid CEFR level', () => {
      const words: CsvWord[] = [
        {
          term: 'test',
          turkishMeaning: 'test',
          cefrLevel: 'X1',
          domain: 'general',
          exampleSentence: '',
        },
      ];
      const result = VocabularyCsvService.validateImport(words);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
    });
  });

  describe('formatImportSummary', () => {
    it('formats summary correctly', () => {
      const result = VocabularyCsvService.validateImport(sampleWords);
      const summary = VocabularyCsvService.formatImportSummary(result);
      expect(summary).toContain('Total rows: 2');
      expect(summary).toContain('Imported: 2');
    });
  });
});
