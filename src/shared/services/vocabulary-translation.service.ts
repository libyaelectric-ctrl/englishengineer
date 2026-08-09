/**
 * Lazy-loaded vocabulary translation layer.
 *
 * Loads the generated translation corpus (data/translations/vocabulary-translations.json)
 * on first use and resolves a term's meaning through the fallback chain:
 * selected learning language → Turkish corpus entry → built-in turkishMeaning → EN definition.
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

export type LanguageMap = Record<string, TermTranslation>;
export type TranslationMap = Record<string, LanguageMap>;

let cache: TranslationMap | null = null;
let pending: Promise<TranslationMap> | null = null;

export const loadVocabularyTranslations = (): Promise<TranslationMap> => {
  if (!pending) {
    pending = import('../../../data/translations/vocabulary-translations.json').then((mod) => {
      cache = (mod.default ?? mod) as TranslationMap;
      return cache;
    });
  }
  return pending;
};

export const isTranslationDataLoaded = (): boolean => cache !== null;

export const getTermTranslation = (term: string, language: string): TermTranslation | undefined =>
  cache?.[term.toLowerCase()]?.[language];

/** Synchronous resolver; returns the best available meaning for the given language. */
export const resolveTermMeaning = (
  term: string,
  source: MeaningSource,
  language: string
): string => {
  const entry = cache?.[term.toLowerCase()];

  // 1. Try the corpus entry for the selected language (skip for English)
  if (language !== 'en') {
    const primary = entry?.[language]?.meaning;
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

/** Async resolver that guarantees the corpus is loaded before resolving. */
export const resolveTermMeaningAsync = async (
  term: string,
  source: MeaningSource,
  language: string
): Promise<string> => {
  await loadVocabularyTranslations();
  return resolveTermMeaning(term, source, language);
};