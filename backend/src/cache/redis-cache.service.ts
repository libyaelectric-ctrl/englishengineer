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
    return false;
  }
};

export const getOrSet = async <T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> => {
  const cached = await redisGet(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // fall through
    }
  }

  const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memEntry && memEntry.expiresAt > Date.now()) {
    return memEntry.value;
  }

  const value = await fetcher();
  const serialized = JSON.stringify(value);

  await redisSet(key, serialized, ttlSeconds);

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  return value;
};
