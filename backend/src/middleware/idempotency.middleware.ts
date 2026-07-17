import { ApiError } from '../errors.js';
import type { Request, Response, NextFunction } from 'express';

interface IdempotencyEntry {
  statusCode: number;
  body: unknown;
  timestamp: number;
}

interface IdempotencyStore {
  get(key: string): Promise<IdempotencyEntry | null>;
  set(key: string, value: IdempotencyEntry): Promise<void>;
  entries?: () => IterableIterator<[string, IdempotencyEntry]>;
  delete?(key: string): void;
}

interface IdempotencyOptions {
  headerName?: string;
  ttlMs?: number;
  store?: IdempotencyStore;
}

let globalIdempotencyStore: IdempotencyStore | null = null;

export const setGlobalIdempotencyStore = (store: IdempotencyStore): void => {
  globalIdempotencyStore = store;
};

export const idempotencyKey = (options: IdempotencyOptions = {}) => {
  const {
    headerName = 'X-Idempotency-Key',
    ttlMs = 24 * 60 * 60 * 1000,
    store = options.store || globalIdempotencyStore || new Map(),
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.headers[headerName.toLowerCase()] as string | undefined;

      if (!key) {
        return next();
      }

      if (typeof key !== 'string' || key.length < 16 || key.length > 256) {
        throw new ApiError(
          400,
          'invalid_idempotency_key',
          'Idempotency key must be a string between 16 and 256 characters.'
        );
      }

      const existing = await store.get(key);
      if (existing) {
        res.status(existing.statusCode).json(existing.body);
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        void Promise.resolve(
          store.set(key, {
            statusCode: res.statusCode,
            body,
            timestamp: Date.now(),
          })
        ).catch(() => {});

        if (typeof store.entries === 'function') {
          const now = Date.now();
          for (const [k, v] of store.entries()) {
            if (now - v.timestamp > ttlMs && store.delete) {
              store.delete(k);
            }
          }
        }

        return originalJson(body) as any;
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const createIdempotencyStore = (
  type: 'memory' | 'redis' = 'memory',
  config: Record<string, any> = {},
  fetchImpl: typeof fetch = fetch
): IdempotencyStore => {
  if (type === 'memory') {
    const map = new Map<string, IdempotencyEntry>();
    return {
      async get(key: string) { return map.get(key) ?? null; },
      async set(key: string, value: IdempotencyEntry) { map.set(key, value); },
      entries() { return map.entries(); },
      delete(key: string) { map.delete(key); },
    };
  }

  if (type === 'redis') {
    const url =
      config.rateLimit?.upstashUrl || process.env.UPSTASH_REDIS_REST_URL;
    const token =
      config.rateLimit?.upstashToken || process.env.UPSTASH_REDIS_REST_TOKEN;
    const timeoutMs = config.rateLimit?.storeTimeoutMs || 3000;

    if (!url || !token) {
      throw new Error(
        'Redis store configured but UPSTASH_REDIS_REST_URL or TOKEN is missing.'
      );
    }

    return {
      async get(key: string): Promise<IdempotencyEntry | null> {
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
        } catch {
          return null;
        } finally {
          clearTimeout(timeoutId);
        }
      },
      async set(key: string, value: IdempotencyEntry): Promise<void> {
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
              '86400000',
            ]),
            signal: controller.signal,
          });
        } catch {
          // Fail silently
        } finally {
          clearTimeout(timeoutId);
        }
      },
    };
  }

  throw new Error(`Unknown idempotency store type: ${type}`);
};
