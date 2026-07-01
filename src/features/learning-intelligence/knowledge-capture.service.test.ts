import { beforeEach, describe, expect, it } from 'vitest';
import { GrammarProgressService, GrammarRepository } from '@/features/grammar';
import {
  VocabularyMenuService,
  VocabularyRepository,
} from '@/features/vocabulary';
import { KnowledgeCaptureService } from './knowledge-capture.service';

describe('KnowledgeCaptureService', () => {
  beforeEach(() => {
    localStorage.clear();
    GrammarProgressService.reset();
    VocabularyMenuService.reset();
  });

  it('connects skill vocabulary and grammar exposure to Learning Memory', async () => {
    const vocabulary = (
      await VocabularyRepository.getVocabularyByLevel('A1')
    )[0];
    const grammar = (await GrammarRepository.getGrammarRulesByLevel('A1'))[0];

    const result = await KnowledgeCaptureService.capture({
      cefrLevel: 'A1',
      vocabularyTerms: [vocabulary.term],
      grammarHints: [grammar.title],
    });

    expect(result.vocabularyAdded).toBe(1);
    expect(result.grammarExposed).toBeGreaterThanOrEqual(1);
    expect(
      VocabularyMenuService.getState().progress[vocabulary.id]?.status
    ).toBe('Learning');
    expect(GrammarProgressService.get(grammar.id).exposures).toBe(1);
  });

  it('never downgrades an existing mastered vocabulary item', async () => {
    const vocabulary = (
      await VocabularyRepository.getVocabularyByLevel('A1')
    )[0];
    VocabularyMenuService.reviewWord(vocabulary.id, true);
    VocabularyMenuService.reviewWord(vocabulary.id, true);
    VocabularyMenuService.reviewWord(vocabulary.id, true);

    await KnowledgeCaptureService.capture({
      cefrLevel: 'A1',
      vocabularyTerms: [vocabulary.term],
    });

    expect(
      VocabularyMenuService.getState().progress[vocabulary.id]?.status
    ).toBe('Mastered');
  });
});
