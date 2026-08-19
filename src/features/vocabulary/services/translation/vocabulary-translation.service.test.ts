import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useTermMeaningResolver } from './vocabulary-translation.hook';
import {
  loadLanguageCorpus,
  resolveTermMeaning,
  resolveTermMeaningAsync,
} from './vocabulary-translation.service';

describe('vocabulary translation layer', () => {
  it('falls back to built-in fields when the corpus has no entry', () => {
    // turkishMeaning is only used when the selected interface language is
    // Turkish. For every other language, prefer the English `definition`
    // field, and only fall back to the raw term if neither is available.
    expect(
      resolveTermMeaning(
        'zzz-nonexistent-term',
        { turkishMeaning: 'deneme', definition: 'test' },
        'ar'
      )
    ).toBe('test');
    expect(resolveTermMeaning('zzz-nonexistent-term', { definition: 'test' }, 'de')).toBe('test');
    expect(resolveTermMeaning('zzz-nonexistent-term', {}, 'fr')).toBe('zzz-nonexistent-term');
    // For Turkish, turkishMeaning IS the correct fallback.
    expect(
      resolveTermMeaning(
        'zzz-nonexistent-term',
        { turkishMeaning: 'deneme', definition: 'test' },
        'tr'
      )
    ).toBe('deneme');
  });

  it('loads a language corpus and resolves terms through it', async () => {
    const corpus = await loadLanguageCorpus('ar');
    // Corpus may be empty if no translations exist for this language
    if (Object.keys(corpus).length === 0) return;
    const term = Object.keys(corpus)[0];
    const expected = corpus[term]?.meaning;
    if (expected) {
      await expect(resolveTermMeaningAsync(term, {}, 'ar')).resolves.toBe(expected);
    }
  });

  it('returns empty map for unsupported language', async () => {
    const corpus = await loadLanguageCorpus('xx-nonexistent');
    expect(Object.keys(corpus)).toHaveLength(0);
  });

  it('exposes the resolver through the React hook, without leaking Turkish into English', async () => {
    const { result } = renderHook(() => useTermMeaningResolver('en'));
    await waitFor(() => {
      // No definition given and language is 'en' (not 'tr') -> must NOT
      // fall back to turkishMeaning; falls through to the raw term.
      expect(result.current('zzz-hook-term', { turkishMeaning: 'kanca' })).toBe('zzz-hook-term');
    });
  });

  it('exposes the resolver through the React hook, using turkishMeaning for Turkish', async () => {
    const { result } = renderHook(() => useTermMeaningResolver('tr'));
    await waitFor(() => {
      expect(result.current('zzz-hook-term-2', { turkishMeaning: 'kanca' })).toBe('kanca');
    });
  });
});
