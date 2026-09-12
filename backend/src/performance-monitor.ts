/**
 * Performance monitoring — now delegates to a MetricsRepository for persistence.
 *
 * The repository is set at startup via {@link setMetricsRepository} (from
 * api-metrics.ts, which shares the same repository instance).
 * Falls back to an in-memory implementation when Supabase is not configured.
 */
import { getMetricsRepository, type MetricsRepository } from './api-metrics.js';

type PerformanceMetricsResult = {
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
};

type RateLimitMetricsResult = {
  totalRequests: number;
  blockedRequests: number;
  blockRate: string;
  byScope: Record<string, { total: number; blocked: number }>;
  recentBlocks: Array<{ scope: string; timestamp: number }>;
};

export const recordRequest = (
  duration: number,
  isError: boolean,
  method?: string,
  path?: string,
): void => {
  getMetricsRepository().recordRequest(duration, isError, method, path);
};

export const getPerformanceMetrics = (): PerformanceMetricsResult =>
  getMetricsRepository().getPerformanceMetrics() as PerformanceMetricsResult;

export const recordRateLimit = (scope: string, blocked: boolean): void => {
  getMetricsRepository().recordRateLimit(scope, blocked);
};

export const getRateLimitMetrics = (): RateLimitMetricsResult =>
  getMetricsRepository().getRateLimitMetrics() as RateLimitMetricsResult;
