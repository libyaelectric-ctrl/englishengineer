// @vitest-environment node
import { SEED_CORPUS_REQUIRED, hasSeedCorpus } from '@/test/seed-corpus';
import { describe, expect, it } from 'vitest';

import { CEFR_LEVELS } from '@/features/level-system';

import { VocabularyEngine } from '../../engine/vocabulary.engine';
import { VocabularyRepository } from './vocabulary.repository';

// The two assertions below are about the corpus itself — its size and its duplicate-free term list
// — so the committed fixture slices cannot stand in for it. They run against a real corpus copy
// (`ENGVOX_TEST_SEED_DIR`) and skip otherwise, leaving the suite deterministic and offline.
const REAL_CORPUS = hasSeedCorpus();

describe('vocabulary database integration', () => {
  it.skipIf(!REAL_CORPUS)(
    `loads 14000+ unique vocabulary terms across every CEFR level ${SEED_CORPUS_REQUIRED}`,
    async () => {
      const levels = await Promise.all(
        CEFR_LEVELS.map((level) => VocabularyRepository.getVocabularyByLevel(level))
      );
      const terms = levels.flat();
      expect(terms.length).toBeGreaterThanOrEqual(14000);
      expect(new Set(terms.map((term) => term.id)).size).toBe(terms.length);
      expect(levels.every((termsAtLevel) => termsAtLevel.length > 0)).toBe(true);
    }
  );

  it.skipIf(!REAL_CORPUS)(
    `contains no duplicate normalized terms ${SEED_CORPUS_REQUIRED}`,
    async () => {
      const levels = await Promise.all(
        CEFR_LEVELS.map((level) => VocabularyRepository.getVocabularyByLevel(level))
      );
      const normalized = levels.flat().map((term) => term.normalizedTerm);
      expect(new Set(normalized).size).toBe(normalized.length);
    }
  );

  it('filters repository terms by level and domain', async () => {
    const a1 = await VocabularyRepository.getVocabularyByLevel('A1');
    const electrical = await VocabularyRepository.getVocabularyByDomain('electrical');
    expect(a1.every((term) => term.cefrLevel === 'A1')).toBe(true);
    expect(electrical.length).toBeGreaterThan(0);
    expect(electrical.every((term) => term.domain === 'electrical')).toBe(true);
  });

  it('keeps A1 speaking vocabulary at A1', async () => {
    const terms = await VocabularyEngine.selectVocabularyForTask('speaking', 'A1');
    expect(terms.length).toBeGreaterThan(0);
    expect(terms.every((term) => term.cefrLevel === 'A1')).toBe(true);
    expect(terms.some((term) => ['C1', 'C2'].includes(term.cefrLevel))).toBe(false);
  });
});
