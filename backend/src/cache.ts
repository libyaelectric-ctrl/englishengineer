/**
 * In-Memory Cache Service
 * For frequently accessed, rarely changing data
 */

interface CacheItem {
  value: unknown;
  expiresAt: number;
  createdAt: number;
}

const cache = new Map<string, CacheItem>();
const defaultTTL = 5 * 60 * 1000; // 5 minutes

export const get = <T = unknown>(key: string): T | null => {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.value as T;
};

export const set = (key: string, value: unknown, ttlMs: number = defaultTTL): void => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    createdAt: Date.now(),
  });
};

export const del = (key: string): void => {
  cache.delete(key);
};

export const has = (key: string): boolean => {
  const item = cache.get(key);
  if (!item) return false;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return false;
  }
  return true;
};

export const clear = (): void => {
  cache.clear();
};

export const getStats = (): { size: number; expired: number } => {
  let expired = 0;

  for (const [, item] of cache.entries()) {
    if (Date.now() > item.expiresAt) {
      expired++;
    }
  }

  return {
    size: cache.size,
    expired,
  };
};

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
      if (now > item.expiresAt) {
        cache.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

// Cache keys
export const CACHE_KEYS = {
  USER_SUBSCRIPTION: (userId: string) => `sub:${userId}`,
  USER_PROFILE: (userId: string) => `profile:${userId}`,
  VOCABULARY_LOOKUP: (level: string, domain: string) => `vocab:${level}:${domain}`,
  HEALTH_CHECK: 'health',
  API_METRICS: 'metrics',
};

// TTL constants
export const TTL = {
  SHORT: 1 * 60 * 1000,
  MEDIUM: 5 * 60 * 1000,
  LONG: 30 * 60 * 1000,
  VERY_LONG: 60 * 60 * 1000,
};
