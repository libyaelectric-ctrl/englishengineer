// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { VocabularyEvaluator } from './vocabulary.evaluator';
import {
  getPreviousDateKey,
  isDueForReview,
  isVocabularyResponseCorrect,
  normalizeVocabularyText,
  sortByNextReview,
} from './vocabulary.helpers';
import { VocabularyEntry } from '../types/vocabulary.types';

const entry: VocabularyEntry = {
  id: 'transformer',
  word: 'Transformer',
  partOfSpeech: 'noun',
  meaning: 'electrical device',
  definition: 'A device that changes AC voltage level.',
  example: 'The transformer was inspected before energization.',
  synonyms: ['voltage converter'],
  collocations: ['step-up transformer'],
  difficulty: 'Intermediate',
  discipline: 'Electrical Engineering',
  CEFR: 'B2',
  tags: ['electrical'],
};

describe('vocabulary helpers and evaluator', () => {
  it('normalizes punctuation and spacing', () => {
    expect(normalizeVocabularyText('  Transformer,   Device! ')).toBe(
      'transformer device'
    );
  });

  it('requires exact normalized equality for correctness', () => {
    expect(isVocabularyResponseCorrect(entry, 'transformer')).toBe(true);
    expect(isVocabularyResponseCorrect(entry, 'not a transformer')).toBe(false);
  });

  it('accepts configured synonym equality', () => {
    expect(isVocabularyResponseCorrect(entry, 'Voltage Converter')).toBe(true);
  });

  it('calculates previous UTC date key', () => {
    expect(getPreviousDateKey('2026-06-01')).toBe('2026-05-31');
  });

  it('detects due review states', () => {
    expect(
      isDueForReview(
        {
          wordId: 'a',
          interval: 1,
          easeFactor: 2.5,
          repetitions: 1,
          nextReview: '2026-06-20T00:00:00.000Z',
          lastReview: null,
        },
        new Date('2026-06-21T00:00:00.000Z')
      )
    ).toBe(true);
  });

  it('sorts review states by next review date', () => {
    const sorted = [
      {
        wordId: 'b',
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: '2026-06-22T00:00:00.000Z',
        lastReview: null,
      },
      {
        wordId: 'a',
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: '2026-06-20T00:00:00.000Z',
        lastReview: null,
      },
    ].sort(sortByNextReview);

    expect(sorted[0].wordId).toBe('a');
  });

  it('evaluates vocabulary accuracy, retention and weak words', () => {
    const result = VocabularyEvaluator.evaluate(
      [
        {
          wordId: 'a',
          mode: 'typing_practice',
          response: 'ok',
          isCorrect: true,
          responseTimeSeconds: 2,
        },
        {
          wordId: 'b',
          mode: 'typing_practice',
          response: 'miss',
          isCorrect: false,
          responseTimeSeconds: 8,
        },
      ],
      {
        a: {
          wordId: 'a',
          interval: 3,
          easeFactor: 2.5,
          repetitions: 2,
          nextReview: '2026-06-30T00:00:00.000Z',
          lastReview: null,
        },
        b: {
          wordId: 'b',
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          nextReview: '2026-06-30T00:00:00.000Z',
          lastReview: null,
        },
      }
    );

    expect(result.accuracy).toBe(50);
    expect(result.retention).toBe(50);
    expect(result.weakWords).toEqual(['b']);
  });
});
