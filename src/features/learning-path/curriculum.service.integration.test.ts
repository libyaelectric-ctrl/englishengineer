import { describe, expect, it } from 'vitest';

import { VocabularyRepository } from '@/shared/services/vocabulary.repository';

import { buildLearningPath } from './curriculum.service';

/**
 * Integration test against the REAL 14.199-term corpus.
 * Proves the path is data-driven, not templated: counts must match the
 * discipline's real domain distribution.
 */
describe('curriculum.service (real vocabulary database)', () => {
  it('builds a path whose term totals match the real discipline corpus', async () => {
    const path = await buildLearningPath('electrical', {
      buildVersion: '2026-08-14',
      termsPerLevel: 12,
    });

    expect(path.stages).toHaveLength(6);
    expect(path.totalLevels).toBeGreaterThan(30);

    const all = await VocabularyRepository.getVocabularyByDomains(['general', 'engineering', 'electrical']);
    expect(path.totalTerms).toBe(all.length);
    // general (2327) + engineering (1104) + electrical (1492)
    expect(path.totalTerms).toBeGreaterThanOrEqual(4900);

    let realTerms = 0;
    for (const stage of path.stages) {
      for (const level of stage.levels) {
        expect(level.termCount).toBeGreaterThan(0);
        realTerms += level.termCount;
      }
    }
    expect(realTerms).toBe(all.length);
  });

  it('produces a full level set for every discipline', async () => {
    for (const discipline of ['architecture', 'software', 'mechanical'] as const) {
      const path = await buildLearningPath(discipline, { buildVersion: '2026-08-14' });
      expect(path.totalLevels).toBeGreaterThan(20);
      expect(path.stages[0].levels[0].termCount).toBeGreaterThan(0);
    }
  });
});