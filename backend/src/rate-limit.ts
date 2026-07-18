import { ApiError } from './errors.js';
import { logger } from './logger.js';
import type { Request, Response, NextFunction } from 'express';

const logRateLimit = (
  scope: string,
  identity: string,
  count: number,
  max: number
): void => {
  if (count > max) {
    logger.warn('Rate limit blocked', { scope, identity, count, max });
  }
};

const UPSTASH_COUNTER_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {count, ttl}
`.trim();

const setRateLimitHeaders = (
  response: Response,
  max: number,
  count: number
): void => {
  const remaining = String(Math.max(0, max - count));
  response.setHeader('RateLimit-Limit', String(max));
  response.setHeader('RateLimit-Remaining', remaining);
  response.setHeader('X-RateLimit-Limit', String(max));
  response.setHeader('X-RateLimit-Remaining', remaining);
};

export interface UpstashRateLimitStore {
  consume: (
    key: string,
    windowMs: number
  ) => Promise<{ count: number; resetAfterMs: number }>;
}

interface UpstashRateLimitConfig {
  url: string;
  token: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export const createUpstashRateLimitStore = ({
  url,
  token,
  timeoutMs = 3_000,
  fetchImpl = fetch,
}: UpstashRateLimitConfig): UpstashRateLimitStore => ({
  async consume(key: string, windowMs: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          'EVAL',
          UPSTASH_COUNTER_SCRIPT,
          '1',
          key,
          String(windowMs),
        ]),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(
          `External rate-limit store returned ${response.status}.`
        );
      }
      const payload = (await response.json()) as { result?: [number, number] };
      const [count, ttlMs] = Array.isArray(payload?.result)
        ? payload.result
        : [];
      if (!Number.isFinite(count) || !Number.isFinite(ttlMs)) {
        throw new Error('External rate-limit store returned malformed data.');
      }
      return { count: count!, resetAfterMs: Math.max(0, ttlMs!) };
    } finally {
      clearTimeout(timeoutId);
    }
  },
});

interface RateLimitStoreConfig {
  storeMode: string;
  upstashUrl: string | null;
  upstashToken: string | null;
  storeTimeoutMs: number;
}

export const createRateLimitStore = (
  config: RateLimitStoreConfig,
  fetchImpl: typeof fetch = fetch
): UpstashRateLimitStore | null => {
  if (config.storeMode === 'memory') return null;
  if (config.storeMode === 'upstash') {
    return createUpstashRateLimitStore({
      url: config.upstashUrl!,
      token: config.upstashToken!,
      timeoutMs: config.storeTimeoutMs,
      fetchImpl,
    });
  }
  throw new Error(`Unsupported rate-limit store: ${config.storeMode}`);
};

type RateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

interface RateLimiterConfig {
  windowMs: number;
  max: number;
  scope: string;
  maxBuckets?: number;
  pruneIntervalMs?: number;
  now?: () => number;
  store?: UpstashRateLimitStore | null;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export const createRateLimiter = ({
  windowMs,
  max,
  scope,
  maxBuckets = 10_000,
  pruneIntervalMs = 60_000,
  now = () => Date.now(),
  store = null,
}: RateLimiterConfig): RateLimitMiddleware => {
  if (store) {
    return async (request: Request, response: Response, next: NextFunction) => {
      const identity = request.auth?.userId || request.ip || 'unknown';
      const key = `engineeros:rate-limit:${scope}:${identity}`;
      try {
        const result = await store.consume(key, windowMs);
        setRateLimitHeaders(response, max, result.count);
        const resetSeconds = String(Math.ceil(result.resetAfterMs / 1_000));
        response.setHeader('RateLimit-Reset', resetSeconds);
        response.setHeader('X-RateLimit-Reset', resetSeconds);
        if (result.count > max) {
          logRateLimit(scope, identity, result.count, max);
          return next(
            new ApiError(
              429,
              'rate_limit_exceeded',
              'Too many requests. Please try again later.'
            )
          );
        }
        return next();
      } catch (error) {
        if (error instanceof ApiError) return next(error);
        return next(
          new ApiError(
            503,
            'rate_limit_store_unavailable',
            'Request protection is temporarily unavailable. Please try again later.'
          )
        );
      }
    };
  }

  const buckets = new Map<string, Bucket>();
  const bucketLimit = Math.max(1, maxBuckets);
  let lastPruneAt = 0;

  const pruneExpired = (currentTime: number): void => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= currentTime) buckets.delete(key);
    }
  };

  const evictOldest = (): void => {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  };

  const getOrCreateBucket = (key: string, currentTime: number): RateBucket => {
    let bucket = buckets.get(key);
    if (bucket && bucket.resetAt <= currentTime) {
      buckets.delete(key);
      bucket = undefined;
    }
    if (!bucket) {
      while (buckets.size >= bucketLimit) evictOldest();
      bucket = { count: 0, resetAt: currentTime + windowMs };
    }
    return bucket;
  };

  return (request: Request, response: Response, next: NextFunction): void => {
    const currentTime = now();
    if (currentTime - lastPruneAt >= pruneIntervalMs || buckets.size >= bucketLimit) {
      pruneExpired(currentTime);
      lastPruneAt = currentTime;
    }

    const identity = request.auth?.userId || request.ip || 'unknown';
    const key = `${scope}:${identity}`;
    const bucket = getOrCreateBucket(key, currentTime);
    bucket.count += 1;
    buckets.set(key, bucket);
    setRateLimitHeaders(response, max, bucket.count);

    if (bucket.count > max) {
      logRateLimit(scope, identity, bucket.count, max);
      return next(new ApiError(429, 'rate_limit_exceeded', 'Too many requests. Please try again later.'));
    }
    next();
  };
};
