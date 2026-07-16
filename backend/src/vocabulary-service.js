import { ApiError } from './errors.js';
import { logger } from './logger.js';

const dictionaryEndpoint = (word) =>
  `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

const fetchWithTimeout = async (fetchImpl, url, init, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
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

const parseDictionaryResponse = (payload) => {
  const entry = Array.isArray(payload) ? payload[0] : null;
  const definitions = entry?.meanings
    ?.flatMap((meaning) => meaning?.definitions ?? [])
    .map((item) => item?.definition)
    .filter((definition) => typeof definition === 'string' && definition.trim())
    .slice(0, 5);
  if (!entry || !definitions?.length) {
    throw new ApiError(
      502,
      'malformed_vocabulary_response',
      'The external dictionary returned an invalid response.'
    );
  }
  return {
    word: typeof entry.word === 'string' ? entry.word : '',
    phonetic:
      typeof entry.phonetic === 'string'
        ? entry.phonetic
        : (entry.phonetics?.find((item) => item?.text)?.text ?? null),
    definitions,
  };
};

const translateWithLibre = async (config, fetchImpl, text, targetLang) => {
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

const translateWithMyMemory = async (config, fetchImpl, text, targetLang) => {
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

/**
 * Creates an Upstash Redis-backed cache for vocabulary lookups.
 * @param {Object} opts - Cache configuration
 * @param {string} opts.url - Upstash Redis REST URL
 * @param {string} opts.token - Upstash Redis auth token
 * @param {number} [opts.timeoutMs=3000] - Request timeout in milliseconds
 * @param {Function} [opts.fetchImpl=fetch] - Fetch implementation for testing
 * @returns {{ get: Function, set: Function }} Cache interface with get/set methods
 */
export const createUpstashVocabularyCache = ({
  url,
  token,
  timeoutMs = 3000,
  fetchImpl = fetch,
}) => ({
  async get(key) {
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
  async set(key, value) {
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
    } catch (err) {
      logger.warn('Vocabulary cache set failed', { message: err?.message });
    } finally {
      clearTimeout(timeoutId);
    }
  },
});

/**
 * Creates a vocabulary lookup service that fetches definitions from Free Dictionary API
 * and translates them using LibreTranslate or MyMemory fallback.
 * @param {Object} config - Service configuration
 * @param {number} config.timeoutMs - Request timeout in milliseconds
 * @param {string} [config.libreTranslateUrl] - LibreTranslate API URL
 * @param {string} [config.libreTranslateApiKey] - LibreTranslate API key
 * @param {boolean} [config.myMemoryEnabled] - Enable MyMemory fallback translation
 * @param {Function} [fetchImpl=fetch] - Fetch implementation for testing
 * @param {Object} [cache=new Map()] - Cache instance (Map or Upstash cache)
 * @returns {{ lookup: Function }} Service with lookup method
 */
export const createVocabularyLookupService = (
  config,
  fetchImpl = fetch,
  cache = new Map()
) => ({
  async lookup(query) {
    const { word, targetLang } = query;
    const cacheKey = `engineeros:cache:vocab:${word.toLowerCase()}:${targetLang}`;
    const cached = await cache.get(cacheKey);
    if (cached) return { ...cached, cached: true };

    const response = await fetchWithTimeout(
      fetchImpl,
      dictionaryEndpoint(word),
      { method: 'GET', headers: { Accept: 'application/json' } },
      config.timeoutMs
    );
    if (!response.ok) {
      throw new ApiError(
        response.status === 404 ? 404 : 502,
        response.status === 404
          ? 'vocabulary_not_found'
          : 'vocabulary_provider_unavailable',
        response.status === 404
          ? 'No external dictionary entry was found.'
          : 'External vocabulary lookup is temporarily unavailable.'
      );
    }

    const parsed = parseDictionaryResponse(await response.json());
    let translation = null;
    try {
      translation =
        (await translateWithLibre(
          config,
          fetchImpl,
          parsed.definitions[0],
          targetLang
        )) ??
        (await translateWithMyMemory(
          config,
          fetchImpl,
          parsed.definitions[0],
          targetLang
        ));
    } catch {
      translation = null;
    }

    const result = {
      ...parsed,
      translation: translation?.text ?? null,
      source: 'Free Dictionary API',
      translationSource: translation?.source ?? null,
      cached: false,
    };
    await cache.set(cacheKey, result);
    return result;
  },
});
