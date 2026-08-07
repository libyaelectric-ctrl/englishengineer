import { beforeEach, describe, expect, it } from 'vitest';

import { getInitialUserLearningProfile } from '@/features/profile';

import { VocabularyMenuService } from './vocabulary.menu';
import { VocabularyRepository } from './vocabulary.repository';
import { selectVocabularyLearningSet } from './vocabulary.selection';

describe('Vocabulary learning set selection', () => {
  beforeEach(() => {
    localStorage.clear();
    VocabularyMenuService.reset();
    VocabularyRepository.clearCache();
  });

  it('returns all eligible terms from the canonical repository', async () => {
    const terms = await VocabularyRepository.getVocabularyByLevel('A1');
    const profile = getInitialUserLearningProfile();
    const selected = selectVocabularyLearningSet(terms, VocabularyMenuService.getState(), {
      cefrBand: profile.skills.vocabulary.cefrBand,
      skillUse: 'vocabulary',
      status: 'New',
    });
    expect(selected.length).toBeGreaterThan(0);
    expect(selected.every((term) => term.cefrLevel === 'A1')).toBe(true);
    expect(selected.every((term) => term.skillUse.includes('vocabulary'))).toBe(true);
  });

  it('returns all eligible terms without arbitrary limits', async () => {
    const terms = await VocabularyRepository.getVocabularyByLevel('A1');
    const state = VocabularyMenuService.getState();
    const options = {
      cefrBand: getInitialUserLearningProfile().skills.vocabulary.cefrBand,
      skillUse: 'vocabulary' as const,
      status: 'New' as const,
    };
    const selected = selectVocabularyLearningSet(terms, state, options);
    const eligibleTerms = terms.filter(
      (term) => term.cefrLevel === 'A1' && term.skillUse.includes('vocabulary')
    );
    expect(selected.length).toBe(eligibleTerms.length);
  });
});