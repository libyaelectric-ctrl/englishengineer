import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLearningStore } from '@/core/learning/learning.store';

import { VocabularyEngine } from '@/shared/services/vocabulary.engine';
import { VocabularyRepository } from '@/shared/services/vocabulary.repository';
import type { CefrLevel } from '@/shared/types/domain.types';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

// Mock dependencies
vi.mock('@/core/learning/learning.store', () => ({
  useLearningStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/shared/services/vocabulary.repository', () => ({
  VocabularyRepository: {
    getVocabularyByLevel: vi.fn(),
  },
}));

vi.mock('@/shared/services/vocabulary-translation.service', () => ({
  resolveTermMeaningAsync: vi.fn(),
}));

describe('VocabularyEngine integration with UNIFIED_DIFFICULTY_SCORING', () => {
  const mockTerm = (overrides: Partial<VocabularyTerm> = {}): VocabularyTerm => ({
    id: 'term-1',
    term: 'test',
    definition: 'Test definition',
    turkishMeaning: 'Test tanımı',
    cefrLevel: 'A1' as CefrLevel,
    domain: 'general',
    skillUse: ['vocabulary'],
    grammarFits: [],
    contentDomain: 'general',
    lifeContext: 'general',
    status: 'approved',
    ...overrides,
  });

  beforeEach(() => {
    vi.stubEnv('VITE_FEATURE_FLAG_UNIFIED_DIFFICULTY', 'false');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('selectVocabularyForTask with flag false', () => {
    it('returns filtered terms without sorting by pool ratio', async () => {
      const terms = [
        mockTerm({ id: 'z-term', term: 'zebra' }),
        mockTerm({ id: 'a-term', term: 'apple' }),
      ];
      (VocabularyRepository.getVocabularyByLevel as vi.Mock).mockResolvedValue(terms);
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: ['known'],
      });

      const result = await VocabularyEngine.selectVocabularyForTask('vocabulary', 'A1');

      // Should return filtered terms in original order (no sorting)
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('z-term');
      expect(result[1].id).toBe('a-term');
    });

    it('filters by domain, contentDomain, and lifeContext', async () => {
      const terms = [
        mockTerm({ id: 't1', domain: 'civil', contentDomain: 'safety', lifeContext: 'site' }),
        mockTerm({
          id: 't2',
          domain: 'electrical',
          contentDomain: 'wiring',
          lifeContext: 'office',
        }),
        mockTerm({ id: 't3', domain: 'civil', contentDomain: 'safety', lifeContext: 'site' }),
      ];
      (VocabularyRepository.getVocabularyByLevel as vi.Mock).mockResolvedValue(terms);
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: [],
      });

      const result = await VocabularyEngine.selectVocabularyForTask(
        'vocabulary',
        'A1',
        'civil',
        'safety',
        'site'
      );

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.domain === 'civil')).toBe(true);
      expect(result.every((t) => t.contentDomain === 'safety')).toBe(true);
      expect(result.every((t) => t.lifeContext === 'site')).toBe(true);
    });
  });

  describe('selectVocabularyForTask with flag true', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_FEATURE_FLAG_UNIFIED_DIFFICULTY', 'true');
    });

    it('sorts terms by pool ratio when flag is enabled', async () => {
      const terms = [
        mockTerm({ id: 't1', term: 'zebra' }),
        mockTerm({ id: 't2', term: 'known' }),
        mockTerm({ id: 't3', term: 'apple' }),
      ];
      (VocabularyRepository.getVocabularyByLevel as vi.Mock).mockResolvedValue(terms);
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: ['known'],
      });

      const result = await VocabularyEngine.selectVocabularyForTask('vocabulary', 'A1');

      // VocabularyTerm has single-word extraction via `term` field.
      // t2 ('known') matches pool → score 0.75; t1, t3 don't match → score 0.25
      // Pool-matching term must sort first
      expect(result[0].id).toBe('t2');
    });

    it('uses vocabularyPool from learning store', async () => {
      const terms = [mockTerm({ id: 't1', term: 'pool-term' })];
      (VocabularyRepository.getVocabularyByLevel as vi.Mock).mockResolvedValue(terms);
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: ['pool-term', 'other-term'],
      });

      const result = await VocabularyEngine.selectVocabularyForTask('vocabulary', 'A1');

      expect(result[0].id).toBe('t1');
      expect(useLearningStore.getState).toHaveBeenCalled();
    });

    it('handles empty pool gracefully', async () => {
      const terms = [mockTerm({ id: 't1', term: 'test' }), mockTerm({ id: 't2', term: 'test2' })];
      (VocabularyRepository.getVocabularyByLevel as vi.Mock).mockResolvedValue(terms);
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: [],
      });

      const result = await VocabularyEngine.selectVocabularyForTask('vocabulary', 'A1');

      // Should return unsorted when pool is empty
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('t1');
      expect(result[1].id).toBe('t2');
    });
  });

  describe('selectVocabularyForGrammar', () => {
    it('filters by grammar fits without pool sorting', async () => {
      const terms = [
        mockTerm({ id: 't1', term: 'test1', grammarFits: ['present-simple'] }),
        mockTerm({ id: 't2', term: 'test2', grammarFits: ['past-simple'] }),
        mockTerm({ id: 't3', term: 'test3', grammarFits: ['present-simple'] }),
      ];
      (VocabularyRepository.getVocabularyByLevel as vi.Mock).mockResolvedValue(terms);

      const result = await VocabularyEngine.selectVocabularyForGrammar(
        'present-simple',
        'A1',
        'vocabulary'
      );

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.grammarFits.includes('present-simple'))).toBe(true);
    });
  });
});
