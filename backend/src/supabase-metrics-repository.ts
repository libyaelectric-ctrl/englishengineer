/**
 * Supabase-backed observability metrics repository.
 *
 * Design: metrics are high-frequency writes (every HTTP request). Writing each
 * request to Supabase synchronously would destroy latency. Instead:
 *
 *  - Endpoint metrics are aggregated in-memory and flushed to Supabase every
 *    {@link FLUSH_INTERVAL_MS}. The in-memory map is the source of truth for
 *    the current window; Supabase is the durable store for historical data.
 *
 *  - Request-level performance metrics are buffered and flushed in batches.
 *    A ring buffer of the most recent {@link MAX_BUFFERED_REQUESTS} entries
 *    stays in memory for real-time p95/p99; the batch is written to Supabase
 *    for historical analysis.
 *
 *  - Rate limit events are buffered identically.
 *
 * When Supabase is unavailable, the in-memory buffer continues to serve
 * real-time reads. Failed flushes are logged but do not block requests.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger.js';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EndpointMetricData {
  count: number;
  totalTime: number;
  errors: number;
}

export interface EndpointMetricResult {
  endpoint: string;
  count: number;
  avgTime: number;
  errorRate: string;
}

interface RequestMetric {
  method?: string;
  path?: string;
  duration: number;
  isError: boolean;
}

interface RateLimitEvent {
  scope: string;
  blocked: boolean;
}

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const FLUSH_INTERVAL_MS = 60_000;        // flush every 60s
const MAX_BUFFERED_REQUESTS = 1_000;     // ring buffer for real-time reads
const MAX_BUFFERED_RATE_LIMITS = 500;

/* ------------------------------------------------------------------ */
/*  Repository interface                                               */
/* ------------------------------------------------------------------ */

export interface MetricsRepository {
  /** Record a completed request. */
  recordEndpoint(method: string, path: string, duration: number, isError: boolean): void;
  /** Get aggregated endpoint metrics (from in-memory + last flush). */
  getEndpointMetrics(): EndpointMetricResult[];
  /** Record a request for performance monitoring. */
  recordRequest(duration: number, isError: boolean, method?: string, path?: string): void;
  /** Get performance metrics (p95, p99, histogram, etc.). */
  getPerformanceMetrics(): PerformanceMetricsResult;
  /** Record a rate limit event. */
  recordRateLimit(scope: string, blocked: boolean): void;
  /** Get rate limit metrics. */
  getRateLimitMetrics(): RateLimitMetricsResult;
  /** Flush buffered data to Supabase. Returns number of rows written. */
  flush(): Promise<{ endpoints: number; requests: number; rateLimits: number }>;
  /** Stop the periodic flush interval. */
  destroy(): void;
}

export interface PerformanceMetricsResult {
  uptime: number;
  requestCount: number;
  errorCount: number;
  errorRate: string;
  avgDuration: number;
  p95Duration: number;
  p99Duration: number;
  memoryUsage: NodeJS.MemoryUsage;
  responseTimeHistogram: Array<{ bucket: string; count: number; percentage: string }>;
  slowestEndpoints: Array<{ endpoint: string; avgDurationMs: number; requestCount: number }>;
}

export interface RateLimitMetricsResult {
  totalRequests: number;
  blockedRequests: number;
  blockRate: string;
  byScope: Record<string, { total: number; blocked: number }>;
  recentBlocks: Array<{ scope: string; timestamp: number }>;
}

/* ------------------------------------------------------------------ */
/*  Supabase implementation                                            */
/* ------------------------------------------------------------------ */

export const createSupabaseMetricsRepository = (
  config: { supabaseUrl: string; supabaseServiceRoleKey: string },
  fetchImpl: typeof fetch = fetch,
): MetricsRepository => {
  const supabase: SupabaseClient = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  // --- In-memory buffers (source of truth for current window) ---
  const endpointMap = new Map<string, EndpointMetricData>();
  let requests: RequestMetric[] = [];
  let rateLimits: RateLimitEvent[] = [];
  const systemStartTime = Date.now();
  let totalRequests = 0;
  let totalErrors = 0;

  // --- Periodic flush ---
  const flushInterval = setInterval(() => {
    flush().catch((err) => {
      logger.warn('[MetricsRepository] Flush failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, FLUSH_INTERVAL_MS);

  // Ensure timer doesn't keep the process alive
  if (typeof flushInterval === 'object' && 'unref' in flushInterval) {
    flushInterval.unref();
  }

  async function flush(): Promise<{ endpoints: number; requests: number; rateLimits: number }> {
    let endpointsFlushed = 0;
    let requestsFlushed = 0;
    let rateLimitsFlushed = 0;

    // Flush endpoint metrics (upsert)
    if (endpointMap.size > 0) {
      const rows = [...endpointMap.entries()].map(([endpoint, data]) => ({
        endpoint: endpoint.split(' ').slice(1).join(' ') || endpoint,
        method: endpoint.split(' ')[0] || 'UNKNOWN',
        count: data.count,
        total_duration_ms: data.totalTime,
        error_count: data.errors,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase
        .from('api_endpoint_metrics')
        .upsert(rows, { onConflict: 'endpoint,method' });
      if (error) {
        logger.warn('[MetricsRepository] Endpoint flush failed', { error: error.message });
      } else {
        endpointsFlushed = rows.length;
      }
    }

    // Flush request metrics (batch insert)
    if (requests.length > 0) {
      const toFlush = requests;
      requests = [];
      const rows = toFlush.map((r) => ({
        method: r.method ?? null,
        path: r.path ?? null,
        duration_ms: r.duration,
        is_error: r.isError,
        recorded_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('performance_request_metrics').insert(rows);
      if (error) {
        logger.warn('[MetricsRepository] Request flush failed', { error: error.message });
        // Re-add to buffer on failure (keep most recent)
        requests = [...toFlush.slice(-MAX_BUFFERED_REQUESTS), ...requests].slice(-MAX_BUFFERED_REQUESTS);
      } else {
        requestsFlushed = rows.length;
      }
    }

    // Flush rate limit events (batch insert)
    if (rateLimits.length > 0) {
      const toFlush = rateLimits;
      rateLimits = [];
      const rows = toFlush.map((r) => ({
        scope: r.scope,
        blocked: r.blocked,
        recorded_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('rate_limit_events').insert(rows);
      if (error) {
        logger.warn('[MetricsRepository] Rate limit flush failed', { error: error.message });
        rateLimits = [...toFlush.slice(-MAX_BUFFERED_RATE_LIMITS), ...rateLimits].slice(-MAX_BUFFERED_RATE_LIMITS);
      } else {
        rateLimitsFlushed = rows.length;
      }
    }

    return { endpoints: endpointsFlushed, requests: requestsFlushed, rateLimits: rateLimitsFlushed };
  }

  return {
    recordEndpoint(method, path, duration, isError) {
      const endpoint = `${method} ${path}`;
      if (!endpointMap.has(endpoint)) {
        endpointMap.set(endpoint, { count: 0, totalTime: 0, errors: 0 });
      }
      const data = endpointMap.get(endpoint)!;
      data.count++;
      data.totalTime += duration;
      if (isError) data.errors++;
    },

    getEndpointMetrics() {
      const results: EndpointMetricResult[] = [];
      for (const [endpoint, data] of endpointMap.entries()) {
        const avgTime = data.count > 0 ? data.totalTime / data.count : 0;
        const errorRate = data.count > 0 ? (data.errors / data.count) * 100 : 0;
        results.push({
          endpoint,
          count: data.count,
          avgTime: Math.round(avgTime),
          errorRate: errorRate.toFixed(2) + '%',
        });
      }
      return results.sort((a, b) => b.count - a.count);
    },

    recordRequest(duration, isError, method, path) {
      requests.push({ duration, path, method, isError });
      if (requests.length > MAX_BUFFERED_REQUESTS) {
        requests = requests.slice(-MAX_BUFFERED_REQUESTS);
      }
      totalRequests++;
      if (isError) totalErrors++;
    },

    getPerformanceMetrics() {
      const durations = requests.map((r) => r.duration);
      const avgDuration = durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;
      const sorted = [...durations].sort((a, b) => a - b);
      const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
      const p99 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] : 0;
      const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

      const histogramBuckets = [
        { label: '0-50ms', min: 0, max: 50, count: 0 },
        { label: '50-100ms', min: 50, max: 100, count: 0 },
        { label: '100-200ms', min: 100, max: 200, count: 0 },
        { label: '200-500ms', min: 200, max: 500, count: 0 },
        { label: '500ms-1s', min: 500, max: 1000, count: 0 },
        { label: '1s-5s', min: 1000, max: 5000, count: 0 },
        { label: '>5s', min: 5000, max: Infinity, count: 0 },
      ];
      for (const d of durations) {
        for (const bucket of histogramBuckets) {
          if (d >= bucket.min && d < bucket.max) { bucket.count++; break; }
        }
      }
      const responseTimeHistogram = histogramBuckets.map(({ label, count }) => ({
        bucket: label,
        count,
        percentage: durations.length > 0 ? ((count / durations.length) * 100).toFixed(1) + '%' : '0%',
      }));

      const endpointStats = new Map<string, { total: number; count: number }>();
      for (const r of requests) {
        if (!r.path || !r.method) continue;
        const key = `${r.method} ${r.path}`;
        const existing = endpointStats.get(key) ?? { total: 0, count: 0 };
        existing.total += r.duration;
        existing.count++;
        endpointStats.set(key, existing);
      }
      const slowestEndpoints = [...endpointStats.entries()]
        .map(([endpoint, stats]) => ({
          endpoint,
          avgDurationMs: Math.round(stats.total / stats.count),
          requestCount: stats.count,
        }))
        .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
        .slice(0, 10);

      return {
        uptime: Date.now() - systemStartTime,
        requestCount: totalRequests,
        errorCount: totalErrors,
        errorRate: errorRate.toFixed(2) + '%',
        avgDuration: Math.round(avgDuration),
        p95Duration: Math.round(p95),
        p99Duration: Math.round(p99),
        memoryUsage: process.memoryUsage(),
        responseTimeHistogram,
        slowestEndpoints,
      };
    },

    recordRateLimit(scope, blocked) {
      rateLimits.push({ scope, blocked });
      if (rateLimits.length > MAX_BUFFERED_RATE_LIMITS) {
        rateLimits = rateLimits.slice(-MAX_BUFFERED_RATE_LIMITS);
      }
    },

    getRateLimitMetrics() {
      const total = rateLimits.length;
      const blocked = rateLimits.filter((r) => r.blocked).length;
      const blockRate = total > 0 ? ((blocked / total) * 100).toFixed(2) + '%' : '0%';
      const byScope: Record<string, { total: number; blocked: number }> = {};
      for (const entry of rateLimits) {
        if (!byScope[entry.scope]) byScope[entry.scope] = { total: 0, blocked: 0 };
        byScope[entry.scope].total++;
        if (entry.blocked) byScope[entry.scope].blocked++;
      }
      const recentBlocks = rateLimits
        .filter((r) => r.blocked)
        .slice(-20)
        .map(({ scope }) => ({ scope, timestamp: Date.now() }));
      return { totalRequests: total, blockedRequests: blocked, blockRate, byScope, recentBlocks };
    },

    flush,

    destroy() {
      clearInterval(flushInterval);
    },
  };
};

/* ------------------------------------------------------------------ */
/*  In-memory fallback (for dev/test when Supabase is not configured) */
/* ------------------------------------------------------------------ */

export const createMemoryMetricsRepository = (): MetricsRepository => {
  const endpointMap = new Map<string, EndpointMetricData>();
  let requests: RequestMetric[] = [];
  let rateLimits: RateLimitEvent[] = [];
  const systemStartTime = Date.now();
  let totalRequests = 0;
  let totalErrors = 0;

  return {
    recordEndpoint(method, path, duration, isError) {
      const endpoint = `${method} ${path}`;
      if (!endpointMap.has(endpoint)) {
        endpointMap.set(endpoint, { count: 0, totalTime: 0, errors: 0 });
      }
      const data = endpointMap.get(endpoint)!;
      data.count++;
      data.totalTime += duration;
      if (isError) data.errors++;
    },

    getEndpointMetrics() {
      const results: EndpointMetricResult[] = [];
      for (const [endpoint, data] of endpointMap.entries()) {
        const avgTime = data.count > 0 ? data.totalTime / data.count : 0;
        const errorRate = data.count > 0 ? (data.errors / data.count) * 100 : 0;
        results.push({ endpoint, count: data.count, avgTime: Math.round(avgTime), errorRate: errorRate.toFixed(2) + '%' });
      }
      return results.sort((a, b) => b.count - a.count);
    },

    recordRequest(duration, isError, method, path) {
      requests.push({ duration, path, method, isError });
      if (requests.length > 1_000) requests = requests.slice(-1_000);
      totalRequests++;
      if (isError) totalErrors++;
    },

    getPerformanceMetrics() {
      const durations = requests.map((r) => r.duration);
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      const sorted = [...durations].sort((a, b) => a - b);
      const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
      const p99 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] : 0;
      const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

      const histogramBuckets = [
        { label: '0-50ms', min: 0, max: 50, count: 0 },
        { label: '50-100ms', min: 50, max: 100, count: 0 },
        { label: '100-200ms', min: 100, max: 200, count: 0 },
        { label: '200-500ms', min: 200, max: 500, count: 0 },
        { label: '500ms-1s', min: 500, max: 1000, count: 0 },
        { label: '1s-5s', min: 1000, max: 5000, count: 0 },
        { label: '>5s', min: 5000, max: Infinity, count: 0 },
      ];
      for (const d of durations) {
        for (const bucket of histogramBuckets) {
          if (d >= bucket.min && d < bucket.max) { bucket.count++; break; }
        }
      }
      const responseTimeHistogram = histogramBuckets.map(({ label, count }) => ({
        bucket: label, count, percentage: durations.length > 0 ? ((count / durations.length) * 100).toFixed(1) + '%' : '0%',
      }));

      const endpointStats = new Map<string, { total: number; count: number }>();
      for (const r of requests) {
        if (!r.path || !r.method) continue;
        const key = `${r.method} ${r.path}`;
        const existing = endpointStats.get(key) ?? { total: 0, count: 0 };
        existing.total += r.duration;
        existing.count++;
        endpointStats.set(key, existing);
      }
      const slowestEndpoints = [...endpointStats.entries()]
        .map(([endpoint, stats]) => ({ endpoint, avgDurationMs: Math.round(stats.total / stats.count), requestCount: stats.count }))
        .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
        .slice(0, 10);

      return {
        uptime: Date.now() - systemStartTime, requestCount: totalRequests, errorCount: totalErrors,
        errorRate: errorRate.toFixed(2) + '%', avgDuration: Math.round(avgDuration), p95Duration: Math.round(p95), p99Duration: Math.round(p99),
        memoryUsage: process.memoryUsage(), responseTimeHistogram, slowestEndpoints,
      };
    },

    recordRateLimit(scope, blocked) {
      rateLimits.push({ scope, blocked });
      if (rateLimits.length > 500) rateLimits = rateLimits.slice(-500);
    },

    getRateLimitMetrics() {
      const total = rateLimits.length;
      const blocked = rateLimits.filter((r) => r.blocked).length;
      const blockRate = total > 0 ? ((blocked / total) * 100).toFixed(2) + '%' : '0%';
      const byScope: Record<string, { total: number; blocked: number }> = {};
      for (const entry of rateLimits) {
        if (!byScope[entry.scope]) byScope[entry.scope] = { total: 0, blocked: 0 };
        byScope[entry.scope].total++;
        if (entry.blocked) byScope[entry.scope].blocked++;
      }
      const recentBlocks = rateLimits.filter((r) => r.blocked).slice(-20).map(({ scope }) => ({ scope, timestamp: Date.now() }));
      return { totalRequests: total, blockedRequests: blocked, blockRate, byScope, recentBlocks };
    },

    async flush() { return { endpoints: 0, requests: 0, rateLimits: 0 }; },
    destroy() {},
  };
};

/* ------------------------------------------------------------------ */
/*  Factory                                                            */
/* ------------------------------------------------------------------ */

export const createMetricsRepository = (
  config: { repositoryMode?: string; supabaseUrl?: string; supabaseServiceRoleKey?: string },
  fetchImpl: typeof fetch = fetch,
): MetricsRepository => {
  if (
    config.repositoryMode === 'supabase' &&
    config.supabaseUrl &&
    config.supabaseServiceRoleKey
  ) {
    return createSupabaseMetricsRepository(
      { supabaseUrl: config.supabaseUrl, supabaseServiceRoleKey: config.supabaseServiceRoleKey },
      fetchImpl,
    );
  }
  return createMemoryMetricsRepository();
};
