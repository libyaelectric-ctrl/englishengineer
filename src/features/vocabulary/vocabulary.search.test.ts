import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VOCABULARY_ENTRIES } from './vocabulary.data';
import {
  clearVocabularyLookupCache,
  lookupExternalVocabulary,
  searchVocabularyEntries,
} from './vocabulary.search';

describe('vocabulary search and external lookup', () => {
  beforeEach(() => {
    localStorage.clear();
    clearVocabularyLookupCache();
  });

  it('searches term, meaning, category, tags, related terms and examples', () => {
    expect(
      searchVocabularyEntries(VOCABULARY_ENTRIES, 'cable tray').length
    ).toBeGreaterThan(0);
    expect(
      searchVocabularyEntries(VOCABULARY_ENTRIES, 'Electrical Engineering')
        .length
    ).toBeGreaterThan(0);
  });

  it('reports an honest not-configured state without an API URL', async () => {
    await expect(
      lookupExternalVocabulary('panel', { apiUrl: '' })
    ).resolves.toEqual({ status: 'not-configured' });
  });

  it('reports an honest unavailable state for provider failure', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });
    await expect(
      lookupExternalVocabulary('panel', {
        apiUrl: 'http://backend.test',
        fetchImpl,
      })
    ).resolves.toEqual({ status: 'unavailable' });
  });

  it('reuses a successful cached lookup', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        word: 'panel',
        phonetic: '/panel/',
        definitions: ['A board containing electrical controls.'],
        translation: 'pano',
        source: 'Free Dictionary API',
        translationSource: null,
        cached: false,
      }),
    });
    const options = { apiUrl: 'http://backend.test', fetchImpl };
    const first = await lookupExternalVocabulary('panel', options);
    const second = await lookupExternalVocabulary('panel', options);
    expect(first.status).toBe('success');
    expect(second.status).toBe('success');
    if (second.status === 'success') expect(second.result.cached).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
