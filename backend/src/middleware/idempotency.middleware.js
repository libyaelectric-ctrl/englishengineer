import { ApiError } from '../errors.js';

/**
 * Idempotency Key Middleware
 * Prevents duplicate processing of requests using idempotency keys.
 * 
 * Usage:
 * app.post('/api/endpoint', requireBackendAuth, idempotencyKey(), handler)
 */
export const idempotencyKey = (options = {}) => {
  const {
    headerName = 'X-Idempotency-Key',
    ttlMs = 24 * 60 * 60 * 1000, // 24 hours default
    store = new Map(), // In-memory store (use Redis in production)
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

      // Check if key already processed
      const existing = store.get(key);
      if (existing) {
        // Return cached response
        res.status(existing.statusCode).json(existing.body);
        return;
      }

      // Store reference to capture response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Store response for idempotency
        store.set(key, {
          statusCode: res.statusCode,
          body,
          timestamp: Date.now(),
        });

        // Clean up old entries
        const now = Date.now();
        for (const [k, v] of store.entries()) {
          if (now - v.timestamp > ttlMs) {
            store.delete(k);
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
export const createIdempotencyStore = (type = 'memory', config = {}) => {
  if (type === 'memory') {
    return new Map();
  }

  if (type === 'redis') {
    // Redis-based store for production
    // Implement with Upstash Redis
    throw new Error('Redis idempotency store not yet implemented');
  }

  throw new Error(`Unknown idempotency store type: ${type}`);
};
