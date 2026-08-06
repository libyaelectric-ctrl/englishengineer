import { describe, expect, it, vi } from 'vitest';

import { VocabularyRepository } from '@/shared/services/vocabulary.repository';

import { ContentAggregatorService } from './content-aggregator.service';

vi.mock('@/shared/services/vocabulary.repository', () => ({
  VocabularyRepository: {
    getVocabularyByDomains: vi.fn(),
  },
}));

describe('ContentAggregatorService - Data Integrity & Fallback', () => {
  it('removes duplicate terms by id', async () => {
    const duplicateTerms = [
      { id: 'term_001', domain: 'general', skillUse: ['vocabulary'] },
      { id: 'term_001', domain: 'general', skillUse: ['vocabulary'] },
      { id: 'term_002', domain: 'general', skillUse: ['vocabulary'] },
    ] as never;

    vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue(duplicateTerms);

    const pool = await ContentAggregatorService.buildContentPool('general');

    expect(pool.vocabulary.length).toBe(2);
    expect(pool.totalCount).toBe(2);
  });

  it('falls back to base domains on error', async () => {
    const fallbackTerms = [
      { id: 'gen_001', domain: 'general', skillUse: ['vocabulary'] },
    ] as never;

    vi.mocked(VocabularyRepository.getVocabularyByDomains)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(fallbackTerms);

    const pool = await ContentAggregatorService.buildContentPool('unknown');

    expect(pool.totalCount).toBe(1);
    expect(pool.domains).toContain('general');
    expect(pool.domains).toContain('engineering');
  });

  it('never returns empty domains array', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue([]);

    const pool = await ContentAggregatorService.buildContentPool('general');

    expect(pool.domains.length).toBeGreaterThanOrEqual(2);
    expect(pool.domains).toContain('general');
    expect(pool.domains).toContain('engineering');
  });

  it('returns zero counts for all skills when empty', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomains).mockResolvedValue([]);

    const pool = await ContentAggregatorService.buildContentPool('software');

    expect(pool.totalCount).toBe(0);
    expect(pool.vocabulary).toEqual([]);
    expect(pool.readings).toEqual([]);
    expect(pool.listenings).toEqual([]);
    expect(pool.speakings).toEqual([]);
    expect(pool.writings).toEqual([]);
  });
});