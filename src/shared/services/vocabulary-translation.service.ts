/**
 * Lazy-loaded vocabulary translation layer.
 *
 * Each supported language is code-split into its own JSON chunk under
 * src/data/translations/by-lang/. The app only fetches the corpus for the
 * user's selected learning language. `loadVocabularyTranslations()` remains
 * exported as a backward-compatible full-corpus loader (mainly used by tests
 * and debugging tools) and is not part of the runtime hot path.
 */
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

let fullCache: TranslationMap | null = null;
let fullPending: Promise<TranslationMap> | null = null;

const langCache = new Map<string, LanguageMap>();
const pendingLoads = new Map<string, Promise<LanguageMap>>();

const corpusModules = import.meta.glob<{
  default: LanguageMap;
}>('../../data/translations/by-lang/*.json');

const emptyMap: LanguageMap = {};

/** Loads (and caches) the translation corpus for a single language. */
export const loadLanguageCorpus = (language: string): Promise<LanguageMap> => {
  if (langCache.has(language)) return Promise.resolve(langCache.get(language)!);
  if (pendingLoads.has(language)) return pendingLoads.get(language)!;

  const loader = corpusModules[`../../data/translations/by-lang/${language}.json`];
  const load = (loader
    ? loader().then((mod) => {
        const map = mod.default ?? emptyMap;
        langCache.set(language, map);
        pendingLoads.delete(language);
        return map;
      })
    : Promise.resolve<LanguageMap>(emptyMap)
  ).catch(() => {
    langCache.set(language, emptyMap);
    pendingLoads.delete(language);
    return emptyMap;
  });

  pendingLoads.set(language, load);
  return load;
};

/** Loads the full merged corpus from the single 56 MB file (legacy path). */
export const loadVocabularyTranslations = (): Promise<TranslationMap> => {
  if (!fullPending) {
    fullPending = import('../../../data/translations/vocabulary-translations.json').then((mod) => {
      fullCache = (mod.default ?? mod) as TranslationMap;
      return fullCache;
    });
  }
  return fullPending;
};

export const isTranslationDataLoaded = (): boolean => fullCache !== null;

export const getTermTranslation = (term: string, language: string): TermTranslation | undefined =>
  fullCache?.[term.toLowerCase()]?.[language];

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