import { storage } from '@/shared/storage';
import type {
  ExternalLookupState,
  ExternalVocabularyResult,
  VocabularyEntry,
} from './vocabulary.types';

const CACHE_KEY = 'engineeros_vocabulary_lookup_cache';

interface ImportMetaWithVocabularyEnv {
  env: {
    VITE_VOCABULARY_API_URL?: string;
  };
}

const normalize = (value: string): string =>
  value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

export const searchVocabularyEntries = (
  entries: VocabularyEntry[],
  query: string
): VocabularyEntry[] => {
  const target = normalize(query);
  if (!target) return [];
  return entries.filter((entry) =>
    [
      entry.word,
      entry.meaning,
      entry.discipline,
      entry.definition,
      entry.example,
      ...entry.tags,
      ...entry.synonyms,
      ...entry.collocations,
    ].some((value) => normalize(value).includes(target))
  );
};

type LookupCache = Record<string, ExternalVocabularyResult>;

const readCache = (): LookupCache => storage.get<LookupCache>(CACHE_KEY) ?? {};

export const lookupExternalVocabulary = async (
  word: string,
  options: {
    apiUrl?: string;
    fetchImpl?: typeof fetch;
  } = {}
): Promise<ExternalLookupState> => {
  const normalizedWord = normalize(word);
  const env = (import.meta as unknown as ImportMetaWithVocabularyEnv).env;
  const apiUrl = options.apiUrl ?? env.VITE_VOCABULARY_API_URL?.trim();
  if (!apiUrl) return { status: 'not-configured' };

  const cache = readCache();
  const cached = cache[normalizedWord];
  if (cached) {
    return {
      status: 'success',
      result: { ...cached, cached: true },
    };
  }

  try {
    const endpoint = `${apiUrl.replace(/\/$/, '')}/api/vocabulary/lookup?word=${encodeURIComponent(word.trim())}&targetLang=tr`;
    const response = await (options.fetchImpl ?? fetch)(endpoint);
    if (!response.ok) return { status: 'unavailable' };
    const payload: unknown = await response.json();
    if (!isExternalVocabularyResult(payload)) {
      return { status: 'unavailable' };
    }
    const result = { ...payload, cached: false };
    storage.set(CACHE_KEY, { ...cache, [normalizedWord]: result });
    return { status: 'success', result };
  } catch {
    return { status: 'unavailable' };
  }
};

export const isExternalVocabularyResult = (
  value: unknown
): value is ExternalVocabularyResult => {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<ExternalVocabularyResult>;
  return (
    typeof result.word === 'string' &&
    Array.isArray(result.definitions) &&
    result.definitions.every((definition) => typeof definition === 'string') &&
    typeof result.source === 'string'
  );
};

export const clearVocabularyLookupCache = (): void => {
  storage.remove(CACHE_KEY);
};
