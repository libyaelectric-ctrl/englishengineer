import { ApiError } from './errors.js';

const UPSTASH_COUNTER_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {count, ttl}
`.trim();

const setRateLimitHeaders = (response, max, count) => {
  response.setHeader('RateLimit-Limit', String(max));
  response.setHeader('RateLimit-Remaining', String(Math.max(0, max - count)));
};

export const createUpstashRateLimitStore = ({
  url,
  token,
  timeoutMs = 3_000,
  fetchImpl = fetch,
}) => ({
  async consume(key, windowMs) {
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
      const payload = await response.json();
      const [count, ttlMs] = Array.isArray(payload?.result)
        ? payload.result
        : [];
      if (!Number.isFinite(count) || !Number.isFinite(ttlMs)) {
        throw new Error('External rate-limit store returned malformed data.');
      }
      return { count, resetAfterMs: Math.max(0, ttlMs) };
    } finally {
      clearTimeout(timeoutId);
    }
  },
});

export const createRateLimitStore = (config, fetchImpl = fetch) => {
  if (config.storeMode === 'memory') return null;
  if (config.storeMode === 'upstash') {
    return createUpstashRateLimitStore({
      url: config.upstashUrl,
      token: config.upstashToken,
      timeoutMs: config.storeTimeoutMs,
      fetchImpl,
    });
  }
  throw new Error(`Unsupported rate-limit store: ${config.storeMode}`);
};

export const createRateLimiter = ({
  windowMs,
  max,
  scope,
  maxBuckets = 10_000,
  pruneIntervalMs = 60_000,
  now = () => Date.now(),
  store = null,
}) => {
  if (store) {
    return async (request, response, next) => {
      const identity = request.auth?.userId || request.ip || 'unknown';
      const key = `engineeros:rate-limit:${scope}:${identity}`;
      try {
        const result = await store.consume(key, windowMs);
        setRateLimitHeaders(response, max, result.count);
        response.setHeader(
          'RateLimit-Reset',
          String(Math.ceil(result.resetAfterMs / 1_000))
        );
        if (result.count > max) {
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

  const buckets = new Map();
  const bucketLimit = Math.max(1, maxBuckets);
  let lastPruneAt = 0;

  const pruneExpired = (currentTime) => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= currentTime) buckets.delete(key);
    }
  };

  const evictOldest = () => {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  };

  return (request, response, next) => {
    const currentTime = now();
    if (
      currentTime - lastPruneAt >= pruneIntervalMs ||
      buckets.size >= bucketLimit
    ) {
      pruneExpired(currentTime);
      lastPruneAt = currentTime;
    }

    const identity = request.auth?.userId || request.ip || 'unknown';
    const key = `${scope}:${identity}`;
    let bucket = buckets.get(key);
    if (bucket?.resetAt <= currentTime) {
      buckets.delete(key);
      bucket = undefined;
    }
    if (!bucket) {
      while (buckets.size >= bucketLimit) evictOldest();
      bucket = { count: 0, resetAt: currentTime + windowMs };
    }
    bucket.count += 1;
    buckets.set(key, bucket);

    setRateLimitHeaders(response, max, bucket.count);

    if (bucket.count > max) {
      return next(
        new ApiError(
          429,
          'rate_limit_exceeded',
          'Too many requests. Please try again later.'
        )
      );
    }
    next();
  };
};
