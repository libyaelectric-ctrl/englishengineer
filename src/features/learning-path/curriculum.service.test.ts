import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VocabularyRepository } from '@/shared/services/vocabulary.repository';
import type { CefrLevel } from '@/shared/types/domain.types';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

import {
  buildLearningPath,
  getBuildVersion,
  getDisciplineDomains,
  getPathLevelTerms,
} from './curriculum.service';

vi.mock('@/shared/services/vocabulary.repository', () => ({
  VocabularyRepository: { getVocabularyByDomains: vi.fn() },
}));

const makeTerm = (id: string, cefrLevel: CefrLevel, domain: string): VocabularyTerm =>
  ({ id, cefrLevel, domain, normalizedTerm: id }) as unknown as VocabularyTerm;

const ELECTRICAL_CORPUS: VocabularyTerm[] = [
  ...['a1t1', 'a1t2', 'a1t3', 'a1t4', 'a1t5', 'a1t6', 'a1t7', 'a1t8'].map((id) =>
    makeTerm(id, 'A1', 'general')
  ),
  ...['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'].map((id) => makeTerm(id, 'A1', 'electrical')),
  ...['eng1', 'eng2', 'eng3', 'eng4', 'eng5', 'eng6'].map((id) =>
    makeTerm(id, 'A1', 'engineering')
  ),
  ...['a2t1', 'a2t2', 'a2t3', 'a2t4', 'a2t5', 'a2t6'].map((id) =>
    makeTerm(id, 'A2', 'engineering')
  ),
  ...['b1', 'b2', 'b3', 'b4'].map((id) => makeTerm(id, 'B1', 'electrical')),
];

describe('curriculum.service (logic, mocked corpus)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(ELECTRICAL_CORPUS);
  });

  it('resolves content domains to [general, engineering, discipline]', () => {
    expect(getDisciplineDomains('electrical')).toEqual(['general', 'engineering', 'electrical']);
  });

  it('builds a real-data path with 6 bands and levels chunked from the corpus', async () => {
    const path = await buildLearningPath('electrical', {
      buildVersion: '2026-08-14',
      termsPerLevel: 6,
    });

    expect(path.discipline).toBe('electrical');
    expect(path.stages).toHaveLength(6);
    expect(VocabularyRepository.getVocabularyByDomains).toHaveBeenCalledWith([
      'general',
      'engineering',
      'electrical',
    ]);

    const a1 = path.stages.find((stage) => stage.cefrLevel === 'A1')!;
    // 22 A1 terms in corpus (8 general + 8 electrical + 6 engineering) -> 4 levels of <=6
    expect(a1.levels).toHaveLength(4);
    a1.levels.forEach((level) => expect(level.termCount).toBeLessThanOrEqual(6));
    // level ids are unique and stable
    const ids = a1.levels.flatMap((level) => level.termIds);
    expect(new Set(ids).size).toBe(ids.length);
    expect(a1.levels[0].id).toBe('path-electrical-a1-0');
    expect(a1.levels[0].termIds.every((id) => id.startsWith('path-') === false)).toBe(true);
  });

  it('rotates term selection across build versions (daily rotation)', async () => {
    const dayOne = await buildLearningPath('electrical', {
      buildVersion: '2026-08-14',
      termsPerLevel: 6,
    });
    const dayTwo = await buildLearningPath('electrical', {
      buildVersion: '2026-08-15',
      termsPerLevel: 6,
    });
    const a1DayOne = dayOne.stages.find((s) => s.cefrLevel === 'A1')!.levels[0].termIds;
    const a1DayTwo = dayTwo.stages.find((s) => s.cefrLevel === 'A1')!.levels[0].termIds;
    expect(a1DayOne.join(',')).not.toBe(a1DayTwo.join(','));
  });

  it('keeps term order stable for the same build version', async () => {
    const pathA = await buildLearningPath('electrical', { buildVersion: '2026-08-14' });
    const pathB = await buildLearningPath('electrical', { buildVersion: '2026-08-14' });
    expect(
      pathA.stages.find((s) => s.cefrLevel === 'A1')!.levels[0].termIds
    ).toEqual(pathB.stages.find((s) => s.cefrLevel === 'A1')!.levels[0].termIds);
  });

  it('marks levels completed/in-progress/available/locked from the mastered set', async () => {
    const base = await buildLearningPath('electrical', {
      buildVersion: '2026-08-14',
      termsPerLevel: 6,
    });
    const a1Base = base.stages.find((stage) => stage.cefrLevel === 'A1')!;
    // Master everything in level 0 plus the first half of level 1, derived from
    // the real seeded distribution so the assertion is deterministic.
    const mastered = [...a1Base.levels[0].termIds, ...a1Base.levels[1].termIds.slice(0, 3)];

    const path = await buildLearningPath('electrical', {
      buildVersion: '2026-08-14',
      termsPerLevel: 6,
      masteredTermIds: mastered,
    });

    const a1Stage = path.stages.find((stage) => stage.cefrLevel === 'A1')!;
    expect(a1Stage.levels[0].masteryRatio).toBe(1);
    expect(a1Stage.levels[0].status).toBe('completed');
    expect(a1Stage.levels[1].masteryRatio).toBe(0.5);
    expect(a1Stage.levels[1].status).toBe('in-progress');
    // levels 2,3 untouched -> available (stage 0 always unlocked)
    expect(a1Stage.levels[2].status).toBe('available');

    // A2 unlocks because A1 has a completed level…
    const a2Stage = path.stages.find((stage) => stage.cefrLevel === 'A2')!;
    expect(a2Stage.levels[0].status).toBe('available');

    // …but B1 stays locked because A2 has no completed level yet.
    const b1Stage = path.stages.find((stage) => stage.cefrLevel === 'B1')!;
    expect(b1Stage.levels[0].status).toBe('locked');
  });

  it('keeps later stages locked until a previous stage has a completed level', async () => {
    const path = await buildLearningPath('electrical', {
      buildVersion: '2026-08-14',
      termsPerLevel: 6,
      masteredTermIds: [],
    });
    const a1Stage = path.stages.find((stage) => stage.cefrLevel === 'A1')!;
    const b1Stage = path.stages.find((stage) => stage.cefrLevel === 'B1')!;
    expect(a1Stage.levels[0].status).toBe('available');
    expect(b1Stage.levels[0].status).toBe('locked');
  });

  it('returns real term objects for a level via getPathLevelTerms', async () => {
    const path = await buildLearningPath('electrical', {
      buildVersion: '2026-08-14',
      termsPerLevel: 6,
    });
    const a1Stage = path.stages.find((stage) => stage.cefrLevel === 'A1')!;
    const levelId = a1Stage.levels[0].id;
    const terms = await getPathLevelTerms(path, levelId);
    expect(terms.length).toBe(6);
    expect(terms.every((term) => term.id.startsWith('a1t') || term.id.startsWith('e'))).toBe(true);
    await expect(getPathLevelTerms(path, 'path-electrical-b1-999')).resolves.toEqual([]);
  });

  it('flags the current band stage', async () => {
    const path = await buildLearningPath('electrical', {
      buildVersion: '2026-08-14',
      currentBand: 'B1+',
    });
    const current = path.stages.find((stage) => stage.isCurrent);
    expect(current?.cefrLevel).toBe('B1');
  });

  it('produces a date-based build version', () => {
    expect(getBuildVersion(new Date('2026-08-14T09:00:00Z'))).toBe('2026-08-14');
  });
});
