import { ApiError } from '../errors.js';

/**
 * Idempotency Key Middleware
 * Prevents duplicate processing of requests using idempotency keys.
 *
 * Usage:
 * app.post('/api/endpoint', requireBackendAuth, idempotencyKey(), handler)
 */
let globalIdempotencyStore = null;

/**
 * Configure the global idempotency store
 */
export const setGlobalIdempotencyStore = (store) => {
  globalIdempotencyStore = store;
};

export const idempotencyKey = (options = {}) => {
  const {
    headerName = 'X-Idempotency-Key',
    ttlMs = 24 * 60 * 60 * 1000, // 24 hours default
    store = options.store || globalIdempotencyStore || new Map(),
  } = options;

  return async (req, res, next) => {
    try {
      const key = req.headers[headerName.toLowerCase()];

      // Skip if no idempotency key
      if (!key) {
        return next();
      }

      // Validate key format (UUID recommended)
      if (typeof key !== 'string' || key.length < 16 || key.length > 256) {
        throw new ApiError(
          400,
          'invalid_idempotency_key',
          'Idempotency key must be a string between 16 and 256 characters.'
        );
      }

      // Check if key already processed (support both async and sync stores)
      const existing = await store.get(key);
      if (existing) {
        // Return cached response
        res.status(existing.statusCode).json(existing.body);
        return;
      }

      // Store reference to capture response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Store response for idempotency
        void Promise.resolve(
          store.set(key, {
            statusCode: res.statusCode,
            body,
            timestamp: Date.now(),
          })
        ).catch(() => {});

        // Clean up old entries (only for in-memory Map)
        if (typeof store.entries === 'function') {
          const now = Date.now();
          for (const [k, v] of store.entries()) {
            if (now - v.timestamp > ttlMs) {
              store.delete(k);
            }
          }
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Create idempotency store with configurable backend
 */
export const createIdempotencyStore = (type = 'memory', config = {}, fetchImpl = fetch) => {
  if (type === 'memory') {
    return new Map();
  }

  if (type === 'redis') {
    const url = config.rateLimit?.upstashUrl || process.env.UPSTASH_REDIS_REST_URL;
    const token = config.rateLimit?.upstashToken || process.env.UPSTASH_REDIS_REST_TOKEN;
    const timeoutMs = config.rateLimit?.storeTimeoutMs || 3000;

    if (!url || !token) {
      throw new Error('Redis store configured but UPSTASH_REDIS_REST_URL or TOKEN is missing.');
    }

    return {
      get: async (key) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetchImpl(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(['GET', `engineeros:idempotency:${key}`]),
            signal: controller.signal,
          });
          if (!response.ok) return null;
          const payload = await response.json();
          return payload?.result ? JSON.parse(payload.result) : null;
        } catch (error) {
          return null;
        } finally {
          clearTimeout(timeoutId);
        }
      },
      set: async (key, value) => {
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
              `engineeros:idempotency:${key}`,
              JSON.stringify(value),
              'PX',
              '86400000', // 24 hours TTL
            ]),
            signal: controller.signal,
          });
        } catch (error) {
          // Fail silently
        } finally {
          clearTimeout(timeoutId);
        }
      },
    };
  }

  throw new Error(`Unknown idempotency store type: ${type}`);
};
