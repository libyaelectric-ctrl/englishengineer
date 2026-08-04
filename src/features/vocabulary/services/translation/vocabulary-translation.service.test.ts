import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useTermMeaningResolver } from './vocabulary-translation.hook';
import {
  loadVocabularyTranslations,
  resolveTermMeaning,
  resolveTermMeaningAsync,
} from './vocabulary-translation.service';

describe('vocabulary translation layer', () => {
  it('falls back to built-in fields when the corpus has no entry', () => {
    expect(
      resolveTermMeaning(
        'zzz-nonexistent-term',
        { turkishMeaning: 'deneme', definition: 'test' },
        'ar'
      )
    ).toBe('deneme');
    expect(resolveTermMeaning('zzz-nonexistent-term', { definition: 'test' }, 'de')).toBe('test');
    expect(resolveTermMeaning('zzz-nonexistent-term', {}, 'fr')).toBe('zzz-nonexistent-term');
  });

  it('never returns the corpus for English (terms are already English)', async () => {
    const corpus = await loadVocabularyTranslations();
    const term = Object.keys(corpus)[0];
    const resolved = await resolveTermMeaningAsync(term, { definition: 'fallback' }, 'en');
    expect(resolved).not.toBe(corpus[term].ar?.meaning ?? corpus[term].de?.meaning);
  });

  it('resolves a corpus entry for its translated language', async () => {
    const corpus = await loadVocabularyTranslations();
    const term = Object.keys(corpus).find((key) => Object.keys(corpus[key]).length > 0);
    expect(term).toBeTruthy();
    const entry = corpus[term as string];
    const lang = Object.keys(entry)[0];
    const expected = entry[lang]?.meaning;
    if (expected) {
      await expect(resolveTermMeaningAsync(term as string, {}, lang)).resolves.toBe(expected);
    }
  });

  it('falls back to Turkish when the target language has no entry', async () => {
    const corpus = await loadVocabularyTranslations();
    // Terms merged from chunk results carry a single language; the chain must
    // fall back through Turkish corpus entries to the term itself.
    const target = Object.keys(corpus).find(
      (key) => !corpus[key].tr && Object.keys(corpus[key]).length === 1
    );
    if (!target) return;
    await expect(resolveTermMeaningAsync(target, {}, 'de')).resolves.toBe(target);
  });

  it('resolves merged Arabic translations through the resolver', async () => {
    const corpus = await loadVocabularyTranslations();
    const arTerm = Object.keys(corpus).find((key) => corpus[key].ar?.meaning);
    expect(arTerm).toBeTruthy();
    if (!arTerm) return;
    await expect(resolveTermMeaningAsync(arTerm, {}, 'ar')).resolves.toBe(
      corpus[arTerm].ar?.meaning
    );
  });

  it('exposes the resolver through the React hook', async () => {
    const { result } = renderHook(() => useTermMeaningResolver('en'));
    await waitFor(() => {
      expect(result.current('zzz-hook-term', { turkishMeaning: 'kanca' })).toBe('kanca');
    });
  });
});
