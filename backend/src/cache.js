/**
 * In-Memory Cache Service
 * For frequently accessed, rarely changing data
 */

const cache = new Map();
const defaultTTL = 5 * 60 * 1000; // 5 minutes

export const get = (key) => {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.value;
};

export const set = (key, value, ttlMs = defaultTTL) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    createdAt: Date.now(),
  });
};

export const del = (key) => {
  cache.delete(key);
};

export const has = (key) => {
  const item = cache.get(key);
  if (!item) return false;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return false;
  }
  return true;
};

export const clear = () => {
  cache.clear();
};

export const getStats = () => {
  let hits = 0;
  let misses = 0;
  let expired = 0;

  for (const [key, item] of cache.entries()) {
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
  USER_SUBSCRIPTION: (userId) => `sub:${userId}`,
  USER_PROFILE: (userId) => `profile:${userId}`,
  VOCABULARY_LOOKUP: (level, domain) => `vocab:${level}:${domain}`,
  HEALTH_CHECK: 'health',
  API_METRICS: 'metrics',
};

// TTL constants
export const TTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};
