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

  it('returns a deterministic nine-word set from the canonical repository', async () => {
    const terms = await VocabularyRepository.getVocabularyByLevel('A1');
    const profile = getInitialUserLearningProfile();
    const selected = selectVocabularyLearningSet(
      terms,
      VocabularyMenuService.getState(),
      {
        cefrBand: profile.skills.vocabulary.cefrBand,
        skillUse: 'vocabulary',
        status: 'New',
      }
    );
    expect(selected).toHaveLength(9);
    expect(selected.every((term) => term.cefrLevel === 'A1')).toBe(true);
    expect(selected.every((term) => term.skillUse.includes('vocabulary'))).toBe(
      true
    );
  });

  it('returns the next deterministic nine-word batch without overlap', async () => {
    const terms = await VocabularyRepository.getVocabularyByLevel('A1');
    const state = VocabularyMenuService.getState();
    const options = {
      cefrBand: getInitialUserLearningProfile().skills.vocabulary.cefrBand,
      skillUse: 'vocabulary' as const,
      status: 'New' as const,
    };
    const first = selectVocabularyLearningSet(terms, state, options);
    const second = selectVocabularyLearningSet(terms, state, {
      ...options,
      offset: 9,
    });
    expect(second).toHaveLength(9);
    expect(
      second.every((term) => !first.some((item) => item.id === term.id))
    ).toBe(true);
  });
});
