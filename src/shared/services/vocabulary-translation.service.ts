/**
 * Lazy-loaded vocabulary translation layer.
 *
 * Each supported language is served as a static JSON file from
 * public/data/translations/. The app fetches the corpus for the user's
 * selected learning language at runtime and caches it in IndexedDB for
 * offline access.
 */
import { getCachedSeed, setCachedSeed } from '@/shared/utils/indexed-db';

export interface TermTranslation {
  meaning?: string;
  definition?: string;
  example?: string;
}

export interface MeaningSource {
  turkishMeaning?: string;
  definition?: string;
}

/** term -> translation entry (single-language corpus file). */
export type LanguageMap = Record<string, TermTranslation>;
/** term -> per-language entries (the full merged corpus). */
export type TranslationMap = Record<string, LanguageMap>;

const langCache = new Map<string, LanguageMap>();
const pendingLoads = new Map<string, Promise<LanguageMap>>();

const emptyMap: LanguageMap = {};

/** Loads (and caches) the translation corpus for a single language. */
export const loadLanguageCorpus = (language: string): Promise<LanguageMap> => {
  if (langCache.has(language)) return Promise.resolve(langCache.get(language)!);
  if (pendingLoads.has(language)) return pendingLoads.get(language)!;

  const load = (async () => {
    try {
      // Check IndexedDB cache first
      const cacheKey = `translation_corpus_${language}`;
      const cached = await getCachedSeed<LanguageMap>(cacheKey);
      if (cached && Object.keys(cached).length > 0) {
        langCache.set(language, cached);
        return cached;
      }

      // Fetch from static assets (or the configured data CDN)
      const dataBase = (import.meta.env.VITE_DATA_CDN_URL ?? '').replace(/\/+$/, '');
      const res = await fetch(`${dataBase}/data/translations/${language}.json`);
      if (!res.ok) {
        langCache.set(language, emptyMap);
        return emptyMap;
      }

      const map: LanguageMap = await res.json();
      langCache.set(language, map);

      // Cache in IndexedDB for offline access
      if (Object.keys(map).length > 0) {
        void setCachedSeed(cacheKey, map);
      }

      return map;
    } catch {
      langCache.set(language, emptyMap);
      return emptyMap;
    }
  })();

  pendingLoads.set(language, load);
  load.finally(() => pendingLoads.delete(language));
  return load;
};

/** Synchronous resolver; returns the best available meaning for the given language. */
export const resolveTermMeaning = (
  term: string,
  source: MeaningSource,
  language: string
): string => {
  const entry = langCache.get(language)?.[term.toLowerCase()];

  // 1. Try the corpus entry for the selected language (skip for English)
  if (language !== 'en') {
    const primary = entry?.meaning;
    if (primary) return primary;
  }

  // 2. Turkish users: use the built-in turkishMeaning field
  if (language === 'tr') {
    if (source.turkishMeaning) return source.turkishMeaning;
  }

  // 3. For all other languages (de, ar, es, fr, etc.): show the English definition
  //    Do NOT fall back to Turkish — that would be confusing and incorrect.
  return source.definition || term;
};

/** Async resolver that guarantees the selected language corpus is loaded first. */
export const resolveTermMeaningAsync = async (
  term: string,
  source: MeaningSource,
  language: string
): Promise<string> => {
  await loadLanguageCorpus(language);
  return resolveTermMeaning(term, source, language);
};
