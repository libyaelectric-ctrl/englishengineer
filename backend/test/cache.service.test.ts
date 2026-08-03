import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getOrSet } from '../src/cache/redis-cache.service.js';

describe('Cache Service (getOrSet)', () => {
  it('calls the fetcher and returns its value on cache miss', async () => {
    let fetchCount = 0;
    const result = await getOrSet('key-miss', 60, async () => {
      fetchCount += 1;
      return { data: 'hello' };
    });
    assert.deepEqual(result, { value: { data: 'hello' }, fromCache: false });
    assert.equal(fetchCount, 1);
  });

  it('returns cached value on subsequent calls without calling fetcher again', async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount += 1;
      return 'computed';
    };

    const first = await getOrSet('key-hit', 60, fetcher);
    assert.deepEqual(first, { value: 'computed', fromCache: false });

    const second = await getOrSet('key-hit', 60, fetcher);
    assert.deepEqual(second, { value: 'computed', fromCache: true });
    assert.equal(fetchCount, 1);
  });

  it('returns fresh value after TTL expires', async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount += 1;
      return { counter: fetchCount };
    };

    const first = await getOrSet('key-ttl', 0, fetcher);
    assert.deepEqual(first, { value: { counter: 1 }, fromCache: false });

    // TTL of 0 seconds means the memory cache entry expires immediately
    const second = await getOrSet('key-ttl', 0, fetcher);
    assert.deepEqual(second, { value: { counter: 2 }, fromCache: false });
    assert.equal(fetchCount, 2);
  });

  it('handles complex nested objects', async () => {
    const complex = {
      nested: { arr: [1, 2, 3], flag: true },
      text: 'test',
    };
    const result = await getOrSet('key-complex', 60, async () => complex);
    assert.deepEqual(result.value, complex);
  });

  it('handles null fetcher return values', async () => {
    const result = await getOrSet('key-null', 60, async () => null);
    assert.deepEqual(result, { value: null, fromCache: false });
  });

  it('handles undefined fetcher return values', async () => {
    const result = await getOrSet('key-undef', 60, async () => undefined);
    assert.deepEqual(result, { value: undefined, fromCache: false });
  });

  it('different keys have independent cache entries', async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount += 1;
      return fetchCount;
    };

    const a = await getOrSet('independent-a', 60, fetcher);
    const b = await getOrSet('independent-b', 60, fetcher);
    assert.deepEqual(a, { value: 1, fromCache: false });
    assert.deepEqual(b, { value: 2, fromCache: false });
    assert.equal(fetchCount, 2);
  });

  it('returns fromCache true for expired memory cache within short TTL window', async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount += 1;
      return 'fresh';
    };

    // Use a large TTL so it stays cached
    await getOrSet('key-large-ttl', 60_000, fetcher);
    const cached = await getOrSet('key-large-ttl', 60_000, fetcher);
    assert.equal(cached.fromCache, true);
    assert.equal(fetchCount, 1);
  });

  it('propagates fetcher errors without caching the failed result', async () => {
    const fetcher = async (): Promise<string> => {
      throw new Error('fetch failed');
    };

    await assert.rejects(() => getOrSet('key-error', 60, fetcher), { message: 'fetch failed' });

    // Subsequent call should also call fetcher since nothing was cached
    let fetchCount = 0;
    const retryFetcher = async () => {
      fetchCount += 1;
      return 'recovered';
    };
    await getOrSet('key-error', 60, retryFetcher);
    assert.equal(fetchCount, 1);
  });

  it('handles string values', async () => {
    const result = await getOrSet('key-string', 60, async () => 'plain string');
    assert.deepEqual(result, { value: 'plain string', fromCache: false });
  });

  it('handles numeric values', async () => {
    const result = await getOrSet('key-number', 60, async () => 42);
    assert.deepEqual(result, { value: 42, fromCache: false });
  });

  it('handles array values', async () => {
    const arr = [1, 'two', { three: 3 }];
    const result = await getOrSet('key-array', 60, async () => arr);
    assert.deepEqual(result.value, arr);
  });
});
