import { ApiError } from './errors.js';
import { logger } from './logger.js';
import type { VocabularyConfig } from '../types.js';
import type { VocabularyLookupResult } from '../types.js';

const dictionaryEndpoint = (word: string): string =>
  `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

const fetchWithTimeout = async (
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        504,
        'vocabulary_lookup_timeout',
        'External vocabulary lookup timed out.'
      );
    }
    throw new ApiError(
      502,
      'vocabulary_provider_unavailable',
      'External vocabulary lookup is temporarily unavailable.'
    );
  } finally {
    clearTimeout(timeout);
  }
};

interface DictionaryEntry {
  word?: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string }>;
  meanings?: Array<{
    definitions?: Array<{ definition?: string }>;
  }>;
}

interface ParsedDictionaryResult {
  word: string;
  phonetic: string | null;
  definitions: string[];
}

const parseDictionaryResponse = (payload: unknown): ParsedDictionaryResult => {
  const entry: DictionaryEntry | null = Array.isArray(payload) ? payload[0] : null;
  const definitions = entry?.meanings
    ?.flatMap((meaning) => meaning?.definitions ?? [])
    .map((item) => item?.definition)
    .filter((definition): definition is string => typeof definition === 'string' && !!definition.trim())
    .slice(0, 5);

  if (!entry || !definitions?.length) {
    throw new ApiError(502, 'malformed_vocabulary_response', 'The external dictionary returned an invalid response.');
  }

  const word = typeof entry.word === 'string' ? entry.word : '';
  const phonetic = typeof entry.phonetic === 'string' ? entry.phonetic : null;

  return { word, phonetic, definitions };
};

interface TranslationResult {
  text: string;
  source: string;
}

const translateWithLibre = async (
  config: VocabularyConfig,
  fetchImpl: typeof fetch,
  text: string,
  targetLang: string
): Promise<TranslationResult | null> => {
  if (!config.libreTranslateUrl) return null;
  const response = await fetchWithTimeout(
    fetchImpl,
    config.libreTranslateUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text',
        ...(config.libreTranslateApiKey
          ? { api_key: config.libreTranslateApiKey }
          : {}),
      }),
    },
    config.timeoutMs
  );
  if (!response.ok) return null;
  const payload = await response.json();
  return typeof payload?.translatedText === 'string'
    ? { text: payload.translatedText, source: 'LibreTranslate' }
    : null;
};

const translateWithMyMemory = async (
  config: VocabularyConfig,
  fetchImpl: typeof fetch,
  text: string,
  targetLang: string
): Promise<TranslationResult | null> => {
  if (!config.myMemoryEnabled) return null;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(targetLang)}`;
  const response = await fetchWithTimeout(
    fetchImpl,
    url,
    { method: 'GET' },
    config.timeoutMs
  );
  if (!response.ok) return null;
  const payload = await response.json();
  return typeof payload?.responseData?.translatedText === 'string'
    ? { text: payload.responseData.translatedText, source: 'MyMemory fallback' }
    : null;
};

export interface VocabularyCache {
  get(key: string): Promise<VocabularyLookupResult | null>;
  set(key: string, value: VocabularyLookupResult): Promise<void>;
}

interface UpstashCacheOpts {
  url: string;
  token: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export const createUpstashVocabularyCache = ({
  url,
  token,
  timeoutMs = 3000,
  fetchImpl = fetch,
}: UpstashCacheOpts): VocabularyCache => ({
  async get(key: string): Promise<VocabularyLookupResult | null> {
    if (!url || !token) return null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', key]),
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const payload = await response.json();
      const value = payload?.result;
      if (typeof value !== 'string') return null;
      return JSON.parse(value);
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  async set(key: string, value: VocabularyLookupResult): Promise<void> {
    if (!url || !token) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await fetchImpl(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          'SET',
          key,
          JSON.stringify(value),
          'EX',
          '604800',
        ]),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      logger.warn('Vocabulary cache set failed', { message: err instanceof Error ? err.message : String(err) });
    } finally {
      clearTimeout(timeoutId);
    }
  },
});

const translateWithFallback = async (config: VocabularyConfig, fetchImpl: typeof fetch, text: string, targetLang: string): Promise<TranslationResult | null> => {
  try {
    return (await translateWithLibre(config, fetchImpl, text, targetLang)) ?? (await translateWithMyMemory(config, fetchImpl, text, targetLang));
  } catch { return null; }
};

export interface VocabularyLookupService {
  lookup(query: {
    word: string;
    targetLang: string;
  }): Promise<VocabularyLookupResult>;
}

export const createVocabularyLookupService = (
  config: VocabularyConfig,
  fetchImpl: typeof fetch = fetch,
  cache: VocabularyCache = new Map() as unknown as VocabularyCache
): VocabularyLookupService => ({
  async lookup(query) {
    const { word, targetLang } = query;
    const cacheKey = `engineeros:cache:vocab:${word.toLowerCase()}:${targetLang}`;
    const cached = await cache.get(cacheKey);
    if (cached) return { ...cached, cached: true };

    const response = await fetchWithTimeout(fetchImpl, dictionaryEndpoint(word), { method: 'GET', headers: { Accept: 'application/json' } }, config.timeoutMs);
    const is404 = response.status === 404;
    if (!response.ok) throw new ApiError(is404 ? 404 : 502, is404 ? 'vocabulary_not_found' : 'vocabulary_provider_unavailable', is404 ? 'No external dictionary entry was found.' : 'External vocabulary lookup is temporarily unavailable.');

    const parsed = parseDictionaryResponse(await response.json());
    const translation = await translateWithFallback(config, fetchImpl, parsed.definitions[0], targetLang);

    const result: VocabularyLookupResult = { ...parsed, translation: translation?.text ?? null, source: 'Free Dictionary API', translationSource: translation?.source ?? null, cached: false };
    await cache.set(cacheKey, result);
    return result;
  },
});
