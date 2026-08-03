import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '../src/errors.js';
import {
  type VocabularyCache,
  createUpstashVocabularyCache,
  createVocabularyLookupService,
} from '../src/vocabulary-service.js';

const defaultConfig = {
  timeoutMs: 5_000,
  libreTranslateUrl: null,
  libreTranslateApiKey: null,
  myMemoryEnabled: false,
  rateLimitWindowMs: 900_000,
  rateLimitMax: 60,
};

const createMockDictionaryResponse = (word: string, phonetic: string, definitions: string[]) => ({
  ok: true,
  status: 200,
  json: async () => [
    {
      word,
      phonetic,
      phonetics: [{ text: phonetic }],
      meanings: [
        {
          definitions: definitions.map((definition) => ({ definition })),
        },
      ],
    },
  ],
});

const createMock404Response = () => ({
  ok: false,
  status: 404,
  json: async () => ({ title: 'No Definitions Found' }),
});

const createMock500Response = () => ({
  ok: false,
  status: 500,
  json: async () => ({ error: 'Server Error' }),
});

const createMemoryCache = (): VocabularyCache => {
  const store = new Map<string, ReturnType<typeof Object>>();
  return {
    async get(key) {
      return (store.get(key) as ReturnType<typeof Object>) ?? null;
    },
    async set(key, value) {
      store.set(key, value);
    },
  };
};

describe('Vocabulary Lookup Service', () => {
  describe('lookup', () => {
    it('fetches word data from the dictionary API', async () => {
      const fetchImpl = async (url: string) => {
        if (url.includes('dictionaryapi')) {
          return createMockDictionaryResponse('panel', '/ˈpæn.əl/', [
            'A flat surface that forms part of a larger object.',
            'A board that contains electrical controls.',
          ]);
        }
        return new Response('Not Found', { status: 404 });
      };

      const service = createVocabularyLookupService(defaultConfig, fetchImpl as typeof fetch);
      const result = await service.lookup({ word: 'panel', targetLang: 'tr' });

      assert.equal(result.word, 'panel');
      assert.equal(result.phonetic, '/ˈpæn.əl/');
      assert.equal(result.definitions.length, 2);
      assert.equal(result.definitions[0], 'A flat surface that forms part of a larger object.');
      assert.equal(result.source, 'Free Dictionary API');
      assert.equal(result.cached, false);
    });

    it('throws vocabulary_not_found for unknown words', async () => {
      const fetchImpl = async () => createMock404Response() as Response;
      const service = createVocabularyLookupService(defaultConfig, fetchImpl as typeof fetch);

      await assert.rejects(
        () => service.lookup({ word: 'xyznotaword', targetLang: 'tr' }),
        (err: unknown) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 404);
          assert.equal(err.code, 'vocabulary_not_found');
          return true;
        }
      );
    });

    it('throws vocabulary_provider_unavailable on server errors', async () => {
      const fetchImpl = async () => createMock500Response() as Response;
      const service = createVocabularyLookupService(defaultConfig, fetchImpl as typeof fetch);

      await assert.rejects(
        () => service.lookup({ word: 'panel', targetLang: 'tr' }),
        (err: unknown) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 502);
          assert.equal(err.code, 'vocabulary_provider_unavailable');
          return true;
        }
      );
    });

    it('throws on network failure', async () => {
      const fetchImpl = async () => {
        throw new Error('Network error');
      };
      const service = createVocabularyLookupService(defaultConfig, fetchImpl as typeof fetch);

      await assert.rejects(
        () => service.lookup({ word: 'panel', targetLang: 'tr' }),
        (err: unknown) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 502);
          assert.equal(err.code, 'vocabulary_provider_unavailable');
          return true;
        }
      );
    });

    it('throws timeout error when fetch takes too long', async () => {
      const fetchImpl = async () => {
        const error = new Error('Aborted') as Error & { name: string };
        error.name = 'AbortError';
        throw error;
      };
      const service = createVocabularyLookupService(defaultConfig, fetchImpl as typeof fetch);

      await assert.rejects(
        () => service.lookup({ word: 'panel', targetLang: 'tr' }),
        (err: unknown) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 504);
          assert.equal(err.code, 'vocabulary_lookup_timeout');
          return true;
        }
      );
    });

    it('caches results and returns cached version on repeat lookups', async () => {
      let fetchCount = 0;
      const fetchImpl = async (url: string) => {
        if (url.includes('dictionaryapi')) {
          fetchCount += 1;
          return createMockDictionaryResponse('test', '/test/', ['A test definition.']);
        }
        return new Response('Not Found', { status: 404 });
      };

      const cache = createMemoryCache();
      const service = createVocabularyLookupService(
        defaultConfig,
        fetchImpl as typeof fetch,
        cache
      );

      const first = await service.lookup({ word: 'test', targetLang: 'tr' });
      const second = await service.lookup({ word: 'test', targetLang: 'tr' });

      assert.equal(first.cached, false);
      assert.equal(second.cached, true);
      assert.equal(fetchCount, 1);
      assert.equal(second.word, 'test');
    });

    it('uses different cache keys for different languages', async () => {
      let fetchCount = 0;
      const fetchImpl = async (url: string) => {
        if (url.includes('dictionaryapi')) {
          fetchCount += 1;
          return createMockDictionaryResponse('hello', '/hɛˈloʊ/', ['A greeting.']);
        }
        return new Response('Not Found', { status: 404 });
      };

      const cache = createMemoryCache();
      const service = createVocabularyLookupService(
        defaultConfig,
        fetchImpl as typeof fetch,
        cache
      );

      await service.lookup({ word: 'hello', targetLang: 'tr' });
      await service.lookup({ word: 'hello', targetLang: 'de' });

      assert.equal(fetchCount, 2, 'Different languages should produce separate API calls');
    });

    it('handles malformed dictionary response by throwing', async () => {
      const fetchImpl = async (url: string) => {
        if (url.includes('dictionaryapi')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ invalid: 'structure' }),
          };
        }
        return new Response('Not Found', { status: 404 });
      };
      const service = createVocabularyLookupService(defaultConfig, fetchImpl as typeof fetch);

      await assert.rejects(
        () => service.lookup({ word: 'test', targetLang: 'tr' }),
        (err: unknown) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.code, 'malformed_vocabulary_response');
          return true;
        }
      );
    });

    it('handles empty definitions in dictionary response', async () => {
      const fetchImpl = async (url: string) => {
        if (url.includes('dictionaryapi')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              {
                word: 'test',
                phonetic: '/test/',
                meanings: [{ definitions: [] }],
              },
            ],
          };
        }
        return new Response('Not Found', { status: 404 });
      };
      const service = createVocabularyLookupService(defaultConfig, fetchImpl as typeof fetch);

      await assert.rejects(
        () => service.lookup({ word: 'test', targetLang: 'tr' }),
        (err: unknown) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.code, 'malformed_vocabulary_response');
          return true;
        }
      );
    });

    it('limits definitions to 5', async () => {
      const manyDefinitions = Array.from({ length: 10 }, (_, i) => `Definition ${i + 1}`);
      const fetchImpl = async (url: string) => {
        if (url.includes('dictionaryapi')) {
          return createMockDictionaryResponse('many', '/many/', manyDefinitions);
        }
        return new Response('Not Found', { status: 404 });
      };
      const service = createVocabularyLookupService(defaultConfig, fetchImpl as typeof fetch);

      const result = await service.lookup({ word: 'many', targetLang: 'tr' });
      assert.equal(result.definitions.length, 5);
    });
  });

  describe('Upstash Vocabulary Cache', () => {
    it('returns null when URL and token are missing', async () => {
      const cache = createUpstashVocabularyCache({
        url: '',
        token: '',
      });
      const result = await cache.get('some-key');
      assert.equal(result, null);
    });

    it('does not throw on set when URL is empty', async () => {
      const cache = createUpstashVocabularyCache({
        url: '',
        token: '',
      });
      // Should not throw
      await cache.set('key', {
        word: 'test',
        phonetic: null,
        definitions: [],
        translation: null,
        source: 'test',
        translationSource: null,
        cached: false,
      });
    });

    it('fetches cached value from Upstash', async () => {
      const cachedData = {
        word: 'cached',
        phonetic: '/kæʃt/',
        definitions: ['A cached definition.'],
        translation: null,
        source: 'test',
        translationSource: null,
        cached: true,
      };
      let capturedRequest: { url: string; init: RequestInit } | null = null;
      const cache = createUpstashVocabularyCache({
        url: 'https://cache.example.test',
        token: 'token',
        fetchImpl: async (url, init) => {
          capturedRequest = { url: url as string, init: init as RequestInit };
          return new Response(JSON.stringify({ result: JSON.stringify(cachedData) }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        },
      });

      const result = await cache.get('engineeros:cache:vocab:cached:tr');
      assert.deepEqual(result, cachedData);
      assert.equal(capturedRequest!.url, 'https://cache.example.test');
    });

    it('returns null on malformed Upstash response', async () => {
      const cache = createUpstashVocabularyCache({
        url: 'https://cache.example.test',
        token: 'token',
        fetchImpl: async () =>
          new Response(JSON.stringify({ result: 12345 }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      });

      const result = await cache.get('some-key');
      assert.equal(result, null);
    });

    it('returns null on Upstash network error', async () => {
      const cache = createUpstashVocabularyCache({
        url: 'https://cache.example.test',
        token: 'token',
        fetchImpl: async () => {
          throw new Error('network');
        },
      });

      const result = await cache.get('some-key');
      assert.equal(result, null);
    });
  });
});
