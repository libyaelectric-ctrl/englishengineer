import { describe, expect, it, vi } from 'vitest';

import { getDisciplineDomains } from '@/shared/services/profile-engine.service';
import { VocabularyRepository } from '@/shared/services/vocabulary.repository';

vi.mock('@/shared/services/vocabulary.repository', () => ({
  VocabularyRepository: {
    getVocabularyByDomain: vi.fn(),
  },
}));

describe('getDisciplineDomains', () => {
  it('Senaryo A: returns all 3 domains when discipline has words', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomain).mockResolvedValue([
      { id: 'test_1', domain: 'electrical' },
    ] as never);

    const result = await getDisciplineDomains('user_123', 'electrical');

    expect(result).toEqual(['general', 'engineering', 'electrical']);
  });

  it('Senaryo B: falls back to general+engineering when discipline is empty', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomain).mockResolvedValue([]);

    const result = await getDisciplineDomains('user_456', 'chemical');

    expect(result).toEqual(['general', 'engineering']);
  });

  it('Senaryo C: returns general+engineering when no discipline provided', async () => {
    const result = await getDisciplineDomains('user_789', undefined);

    expect(result).toEqual(['general', 'engineering']);
    expect(VocabularyRepository.getVocabularyByDomain).not.toHaveBeenCalled();
  });

  it('Senaryo D: falls back to general+engineering on API error', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomain).mockRejectedValue(new Error('Network error'));

    const result = await getDisciplineDomains('user_000', 'mechanical');

    expect(result).toEqual(['general', 'engineering']);
  });

  it('never returns an empty array', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomain).mockResolvedValue([]);

    const result = await getDisciplineDomains('user_x', 'software');

    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result).toContain('general');
    expect(result).toContain('engineering');
  });
});