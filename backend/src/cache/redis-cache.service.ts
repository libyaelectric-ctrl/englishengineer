import { logger } from '../logger.js';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
let redisUrl: string | null = null;
let redisToken: string | null = null;

export const initRedisCache = (url?: string, token?: string): void => {
  redisUrl = url ?? null;
  redisToken = token ?? null;
  if (redisUrl) {
    logger.info('[RedisCache] Upstash Redis configured');
  } else {
    logger.warn('[RedisCache] No Redis URL — using in-memory cache');
  }
};

const redisGet = async (key: string): Promise<string | null> => {
  if (!redisUrl || !redisToken) return null;
  try {
    const response = await fetch(redisUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['GET', key]),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { result?: string };
    return typeof payload?.result === 'string' ? payload.result : null;
  } catch {
    /* graceful degradation: cache miss */
    return null;
  }
};

const redisSet = async (key: string, value: string, ttlSeconds: number): Promise<boolean> => {
  if (!redisUrl || !redisToken) return false;
  try {
    const response = await fetch(redisUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['SETEX', key, String(ttlSeconds), value]),
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    /* graceful degradation: cache miss */
    return false;
  }
};

export interface CacheResult<T> {
  value: T;
  fromCache: boolean;
}

export const getOrSet = async <T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<CacheResult<T>> => {
  const cached = await redisGet(key);
  if (cached) {
    try {
      return { value: JSON.parse(cached) as T, fromCache: true };
    } catch {
      /* graceful degradation: cache miss */
      // fall through
    }
  }

  const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memEntry && memEntry.expiresAt > Date.now()) {
    return { value: memEntry.value, fromCache: true };
  }

  const value = await fetcher();
  const serialized = JSON.stringify(value);

  await redisSet(key, serialized, ttlSeconds);

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  return { value, fromCache: false };
};

/** Invalidate a specific cache key */
export const invalidateCache = async (key: string): Promise<void> => {
  memoryCache.delete(key);
  if (redisUrl && redisToken) {
    try {
      await fetch(redisUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['DEL', key]),
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      /* graceful degradation: cache miss */
      // Best effort
    }
  }
};

/** Invalidate all keys matching a prefix */
export const invalidateByPrefix = async (prefix: string): Promise<void> => {
  // Clear memory cache entries matching prefix
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
  // Redis: scan and delete matching keys
  if (redisUrl && redisToken) {
    try {
      const response = await fetch(redisUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SCAN', '0', 'MATCH', `${prefix}*`, 'COUNT', '100']),
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const payload = (await response.json()) as { result?: [string, string[]] };
        const keys = payload?.result?.[1] ?? [];
        for (const key of keys) {
          await redisSet(key, '', 1); // Set to expire immediately
        }
      }
    } catch {
      /* graceful degradation: cache miss */
      // Best effort
    }
  }
};

/** Get cache statistics */
export const getCacheStats = (): {
  memoryEntries: number;
  redisConfigured: boolean;
} => {
  return {
    memoryEntries: memoryCache.size,
    redisConfigured: Boolean(redisUrl && redisToken),
  };
};
