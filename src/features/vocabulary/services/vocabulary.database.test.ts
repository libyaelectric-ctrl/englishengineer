// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { CEFR_LEVELS } from '@/features/level-system';
import { VocabularyEngine } from '../engine/vocabulary.engine';
import { VocabularyRepository } from './vocabulary.repository';

describe('vocabulary database integration', () => {
  it('loads 5000 unique vocabulary terms across every CEFR level', async () => {
    const levels = await Promise.all(
      CEFR_LEVELS.map((level) =>
        VocabularyRepository.getVocabularyByLevel(level)
      )
    );
    const terms = levels.flat();
    expect(terms).toHaveLength(5000);
    expect(new Set(terms.map((term) => term.id)).size).toBe(5000);
    expect(levels.map((termsAtLevel) => termsAtLevel.length)).toEqual([
      263, 667, 1651, 1847, 507, 65,
    ]);
  });

  it('contains no duplicate normalized terms', async () => {
    const levels = await Promise.all(
      CEFR_LEVELS.map((level) =>
        VocabularyRepository.getVocabularyByLevel(level)
      )
    );
    const normalized = levels.flat().map((term) => term.normalizedTerm);
    expect(new Set(normalized).size).toBe(normalized.length);
  });

  it('filters repository terms by level and domain', async () => {
    const a1 = await VocabularyRepository.getVocabularyByLevel('A1');
    const electrical =
      await VocabularyRepository.getVocabularyByDomain('electrical');
    expect(a1.every((term) => term.cefrLevel === 'A1')).toBe(true);
    expect(electrical.length).toBeGreaterThan(0);
    expect(electrical.every((term) => term.domain === 'electrical')).toBe(true);
  });

  it('keeps A1 speaking vocabulary at A1', async () => {
    const terms = await VocabularyEngine.selectVocabularyForTask(
      'speaking',
      'A1'
    );
    expect(terms.length).toBeGreaterThan(0);
    expect(terms.every((term) => term.cefrLevel === 'A1')).toBe(true);
    expect(terms.some((term) => ['C1', 'C2'].includes(term.cefrLevel))).toBe(
      false
    );
  });

  it.skip('generates the cross-validation report', () => {
    // Skipped: data/canonical folder removed from repo
  });
});
