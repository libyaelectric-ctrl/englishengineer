import { createHash } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors.js';
interface IdempotencyEntry { statusCode: number; body: unknown; timestamp: number; fingerprint?: string; }
interface IdempotencyStore { get(key: string): Promise<IdempotencyEntry | null>; set(key: string, value: IdempotencyEntry): Promise<void>; entries?: () => IterableIterator<[string, IdempotencyEntry]>; delete?(key: string): void; }
interface IdempotencyOptions { headerName?: string; ttlMs?: number; store?: IdempotencyStore; }
interface PendingEntry { fingerprint: string; response: Promise<IdempotencyEntry | null>; resolve: (entry: IdempotencyEntry | null) => void; reject: (error: unknown) => void; }
let globalIdempotencyStore: IdempotencyStore | null = null;
const pending = new Map<string, PendingEntry>();
export const setGlobalIdempotencyStore = (store: IdempotencyStore): void => { globalIdempotencyStore = store; };
const hash = (value: string): string => createHash('sha256').update(value).digest('hex');
const stable = (value: unknown): string => { if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`; if (value && typeof value === 'object') return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(',')}}`; return JSON.stringify(value) ?? 'null'; };
const identity = (req: Request): string => req.auth?.userId || 'anonymous';
const requestPath = (req: Request): string => (req.originalUrl || req.url || '').split('?')[0];
const scopeKey = (req: Request, key: string): string => req.method && requestPath(req) ? hash(`${identity(req)}\n${req.method.toUpperCase()}\n${requestPath(req)}\n${key}`) : key;
const fingerprint = (req: Request): string => hash(`${req.method || ''}\n${requestPath(req)}\n${stable(req.body ?? null)}`);
const conflict = (): ApiError => new ApiError(409, 'idempotency_key_reused', 'The idempotency key was already used with a different request.');
const replay = (res: Response, entry: IdempotencyEntry): void => { res.setHeader?.('Idempotency-Replayed', 'true'); res.status(entry.statusCode).json(entry.body); };
export const idempotencyKey = (options: IdempotencyOptions = {}) => {
  const { headerName = 'X-Idempotency-Key', ttlMs = 86_400_000, store = globalIdempotencyStore || createMemoryStore() } = options;
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.headers[headerName.toLowerCase()];
      if (header === undefined) return next();
      if (typeof header !== 'string' || header.length < 16 || header.length > 256) throw new ApiError(400, 'invalid_idempotency_key', 'Idempotency key must be a string between 16 and 256 characters.');
      const scoped = scopeKey(req, header); const bodyFingerprint = fingerprint(req);
      const existing = await store.get(scoped);
      if (existing && Date.now() - existing.timestamp <= ttlMs) { if (existing.fingerprint && existing.fingerprint !== bodyFingerprint) throw conflict(); replay(res, existing); return; }
      if (existing && store.delete) store.delete(scoped);
      const inFlight = pending.get(scoped);
      if (inFlight) { if (inFlight.fingerprint !== bodyFingerprint) throw conflict(); const result = await inFlight.response; if (result) replay(res, result); else next(); return; }
      let resolvePending!: (entry: IdempotencyEntry | null) => void;
      let rejectPending!: (error: unknown) => void;
      const response = new Promise<IdempotencyEntry | null>((resolve, reject) => { resolvePending = resolve; rejectPending = reject; });
      void response.catch(() => undefined);
      pending.set(scoped, { fingerprint: bodyFingerprint, response, resolve: resolvePending, reject: rejectPending });
      const originalJson = res.json.bind(res); let settled = false;
      const settle = (entry: IdempotencyEntry | null): void => { if (settled) return; settled = true; pending.delete(scoped); resolvePending(entry); };
      const fail = (error: unknown): void => { if (settled) return; settled = true; pending.delete(scoped); rejectPending(error); };
      res.json = ((body: unknown) => {
        const entry = { statusCode: res.statusCode, body, timestamp: Date.now(), fingerprint: bodyFingerprint };
        res.json = originalJson as typeof res.json;
        void store.set(scoped, entry).then(
          () => { settle(entry); originalJson(body); },
          (error: unknown) => { fail(error); next(error); }
        );
        return res;
      }) as typeof res.json;
      if (typeof res.once === 'function') res.once('close', () => settle(null));
      next();
    } catch (error) { next(error); }
  };
};
const createMemoryStore = (): IdempotencyStore => { const map = new Map<string, IdempotencyEntry>(); return { async get(key) { return map.get(key) ?? null; }, async set(key, value) { map.set(key, value); }, entries: () => map.entries(), delete: (key) => { map.delete(key); } }; };
const idempotencyStoreUnavailable = (cause?: unknown): ApiError => {
  const error = new ApiError(
    503,
    'idempotency_store_unavailable',
    'Idempotent request processing is temporarily unavailable.'
  );
  if (cause instanceof Error) (error as Error & { cause?: Error }).cause = cause;
  return error;
};
const createRedisStore = (config: { rateLimit?: { upstashUrl?: string; upstashToken?: string; storeTimeoutMs?: number } }, fetchImpl: typeof fetch): IdempotencyStore => {
  const url = config.rateLimit?.upstashUrl || process.env.UPSTASH_REDIS_REST_URL; const token = config.rateLimit?.upstashToken || process.env.UPSTASH_REDIS_REST_TOKEN; const timeoutMs = config.rateLimit?.storeTimeoutMs || 3000;
  if (!url || !token) throw new Error('Redis store configured but UPSTASH_REDIS_REST_URL or TOKEN is missing.');
  const redisFetch = async (args: (string | number)[]): Promise<{ result: unknown }> => {
    const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args), signal: controller.signal });
      if (!response.ok) throw new Error(`Redis returned HTTP ${response.status}.`);
      const payload = await response.json() as { result?: unknown };
      if (!Object.prototype.hasOwnProperty.call(payload, 'result')) throw new Error('Redis response is missing result.');
      return { result: payload.result };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw idempotencyStoreUnavailable(error);
    } finally { clearTimeout(timeoutId); }
  };
  return {
    async get(key) {
      const payload = await redisFetch(['GET', `engineeros:idempotency:${key}`]);
      if (payload.result === null) return null;
      if (typeof payload.result !== 'string') throw idempotencyStoreUnavailable();
      try { return JSON.parse(payload.result) as IdempotencyEntry; }
      catch (error) { throw idempotencyStoreUnavailable(error); }
    },
    async set(key, value) {
      const payload = await redisFetch(['SET', `engineeros:idempotency:${key}`, JSON.stringify(value), 'PX', '86400000']);
      if (payload.result !== 'OK') throw idempotencyStoreUnavailable();
    }
  };
};
export const createIdempotencyStore = (type: 'memory' | 'redis' = 'memory', config: { rateLimit?: { upstashUrl?: string; upstashToken?: string; storeTimeoutMs?: number } } = {}, fetchImpl: typeof fetch = fetch): IdempotencyStore => type === 'memory' ? createMemoryStore() : type === 'redis' ? createRedisStore(config, fetchImpl) : (() => { throw new Error(`Unknown idempotency store type: ${type}`); })();
