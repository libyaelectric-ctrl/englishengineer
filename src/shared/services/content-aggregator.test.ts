import { describe, expect, it, vi } from 'vitest';

import type { Discipline } from '@/shared/services/content-aggregator.service';
import { ContentAggregatorService } from '@/shared/services/content-aggregator.service';
import { VocabularyRepository } from '@/shared/services/vocabulary.repository';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

vi.mock('@/shared/services/vocabulary.repository', () => ({
  VocabularyRepository: {
    getVocabularyByDomains: vi.fn(),
    getVocabularyByDomain: vi.fn(),
  },
}));

const createMockTerm = (id: string, domain: string, skills: string[]): VocabularyTerm =>
  ({
    id,
    term: id,
    normalizedTerm: id,
    turkishMeaning: id,
    cefrLevel: 'A1',
    domain,
    contentDomain: domain,
    lifeContext: 'site',
    register: 'neutral',
    primaryUseCase: 'site-task',
    category: 'general',
    termType: 'single_word',
    partOfSpeech: 'noun',
    wordCount: 1,
    definition: `Definition for ${id}`,
    exampleSentence: `Example for ${id}`,
    turkishExample: `Örnek ${id}`,
    relatedTerms: [],
    commonMistakes: '',
    grammarFits: [],
    skillUse: skills,
    tags: [domain],
    source: 'test',
    confidence: 0.9,
    status: 'approved',
    importTier: 'core',
    isCore: false,
    isTechnical: false,
    isProfessionalPhrase: false,
    isContractual: false,
    isDailySiteEnglish: false,
    isLifeWideEnglish: false,
    reviewReason: '',
    variantOf: '',
    grammarDomainAlias: domain,
    qcRepairNotes: '',
  }) as VocabularyTerm;

describe('ContentAggregatorService', () => {
  it('Senaryo A: builds pool with all 3 domains for architecture', async () => {
    const mockTerms = [
      createMockTerm('gen_1', 'general', ['vocabulary', 'reading']),
      createMockTerm('eng_1', 'engineering', ['vocabulary', 'writing']),
      createMockTerm('arch_1', 'architecture', ['vocabulary', 'reading', 'speaking']),
    ];

    vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(mockTerms);

    const pool = await ContentAggregatorService.buildContentPool('architecture');

    expect(pool.domains).toEqual(['general', 'engineering', 'architecture']);
    expect(pool.totalCount).toBe(3);
    expect(pool.vocabulary.length).toBe(3);
    expect(pool.readings.length).toBe(2);
    expect(pool.speakings.length).toBe(1);
    expect(pool.writings.length).toBe(1);
  });

  it('Senaryo B: general user gets only general + engineering', async () => {
    const mockTerms = [
      createMockTerm('gen_1', 'general', ['vocabulary']),
      createMockTerm('eng_1', 'engineering', ['vocabulary']),
    ];

    vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(mockTerms);

    const pool = await ContentAggregatorService.buildContentPool('general');

    expect(pool.domains).toEqual(['general', 'engineering', 'general']);
    expect(pool.totalCount).toBe(2);
  });

  it('Senaryo C: empty discipline falls back gracefully', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue([]);

    const pool = await ContentAggregatorService.buildContentPool('general');

    expect(pool.totalCount).toBe(0);
    expect(pool.vocabulary).toEqual([]);
    expect(pool.domains).toContain('general');
    expect(pool.domains).toContain('engineering');
  });

  it('Senaryo D: correctly categorizes by skill', async () => {
    const mockTerms = [
      createMockTerm('term_1', 'general', ['vocabulary', 'reading', 'listening']),
      createMockTerm('term_2', 'general', ['vocabulary', 'speaking', 'writing']),
    ];

    vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(mockTerms);

    const pool = await ContentAggregatorService.buildContentPool('general');

    expect(pool.vocabulary.length).toBe(2);
    expect(pool.readings.length).toBe(1);
    expect(pool.listenings.length).toBe(1);
    expect(pool.speakings.length).toBe(1);
    expect(pool.writings.length).toBe(1);
  });

  it('never returns null - always returns a valid pool', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue([]);

    const pool = await ContentAggregatorService.buildContentPool('electrical');

    expect(pool).not.toBeNull();
    expect(pool.totalCount).toBeGreaterThanOrEqual(0);
    expect(pool.domains.length).toBeGreaterThanOrEqual(2);
  });
});
