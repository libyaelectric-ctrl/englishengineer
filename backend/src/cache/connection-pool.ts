import { logger } from '../logger.js';

interface PoolConfig {
  maxConnections: number;
  connectionTimeoutMs: number;
  idleTimeoutMs: number;
  /** Minimum connections to keep warm (prevents cold start latency) */
  minConnections: number;
  /** How often to run health check (ms) */
  healthCheckIntervalMs: number;
  /** Max consecutive failures before marking pool as unhealthy */
  maxHealthFailures: number;
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
  maxConnections: 10,
  connectionTimeoutMs: 10_000,
  idleTimeoutMs: 30_000,
  minConnections: 2,
  healthCheckIntervalMs: 60_000,
  maxHealthFailures: 3,
};

export const getPoolConfig = (overrides?: Partial<PoolConfig>): PoolConfig => ({
  ...DEFAULT_POOL_CONFIG,
  ...overrides,
});

// ─── Pool Metrics ───────────────────────────────────────────────

interface PoolMetrics {
  activeConnections: number;
  idleConnections: number;
  totalAcquired: number;
  totalReleased: number;
  totalTimedOut: number;
  totalHealthChecks: number;
  lastHealthCheckAt: string | null;
  isHealthy: boolean;
}

const metrics: PoolMetrics = {
  activeConnections: 0,
  idleConnections: 0,
  totalAcquired: 0,
  totalReleased: 0,
  totalTimedOut: 0,
  totalHealthChecks: 0,
  lastHealthCheckAt: null,
  isHealthy: true,
};

export const getPoolMetrics = (): Readonly<PoolMetrics> => ({ ...metrics });

export const recordAcquire = (): void => {
  metrics.activeConnections++;
  metrics.idleConnections = Math.max(0, metrics.idleConnections - 1);
  metrics.totalAcquired++;
};

export const recordRelease = (): void => {
  metrics.activeConnections = Math.max(0, metrics.activeConnections - 1);
  metrics.idleConnections++;
  metrics.totalReleased++;
};

export const recordTimeout = (): void => {
  metrics.totalTimedOut++;
};

export const recordHealthCheck = (success: boolean): void => {
  metrics.totalHealthChecks++;
  metrics.lastHealthCheckAt = new Date().toISOString();
  metrics.isHealthy = success;
};

// ─── Adaptive Sizing ────────────────────────────────────────────

/**
 * Recommends optimal pool size based on recent metrics.
 * - If timeout rate > 5%, suggests increasing pool
 * - If idle ratio > 80%, suggests decreasing pool
 * - Returns a value between minConnections and maxConnections
 */
export const getRecommendedPoolSize = (
  config: PoolConfig
): { recommended: number; reason: string } => {
  const totalRequests = metrics.totalAcquired;
  if (totalRequests < 50) {
    return { recommended: config.maxConnections, reason: 'insufficient_data' };
  }

  const timeoutRate = metrics.totalTimedOut / totalRequests;
  const idleRate =
    metrics.totalReleased > 0
      ? metrics.idleConnections / (metrics.activeConnections + metrics.idleConnections + 1)
      : 0;

  if (timeoutRate > 0.05) {
    const increased = Math.min(config.maxConnections, config.maxConnections + 5);
    return {
      recommended: increased,
      reason: `high_timeout_rate_${(timeoutRate * 100).toFixed(1)}%`,
    };
  }

  if (idleRate > 0.8 && config.maxConnections > config.minConnections + 2) {
    return {
      recommended: Math.max(config.minConnections, config.maxConnections - 2),
      reason: `high_idle_rate_${(idleRate * 100).toFixed(1)}%`,
    };
  }

  return { recommended: config.maxConnections, reason: 'optimal' };
};

// ─── Health Check ───────────────────────────────────────────────

let healthCheckTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start periodic health checks for the connection pool.
 * Verifies pool metrics are within acceptable bounds.
 */
export const startPoolHealthCheck = (config: PoolConfig): void => {
  if (healthCheckTimer) clearInterval(healthCheckTimer);

  healthCheckTimer = setInterval(() => {
    const total = metrics.activeConnections + metrics.idleConnections;
    const timeoutRate =
      metrics.totalAcquired > 0 ? metrics.totalTimedOut / metrics.totalAcquired : 0;

    const isHealthy = timeoutRate < 0.1 && total <= config.maxConnections * 1.2;
    recordHealthCheck(isHealthy);

    if (!isHealthy) {
      logger.warn('[Pool] Health check failed', {
        activeConnections: metrics.activeConnections,
        idleConnections: metrics.idleConnections,
        timeoutRate: `${(timeoutRate * 100).toFixed(1)}%`,
      });
    }

    const recommendation = getRecommendedPoolSize(config);
    if (recommendation.reason !== 'optimal' && recommendation.reason !== 'insufficient_data') {
      logger.info('[Pool] Adaptive sizing recommendation', {
        current: config.maxConnections,
        recommended: recommendation.recommended,
        reason: recommendation.reason,
      });
    }
  }, config.healthCheckIntervalMs);
  // Don't let this background timer alone keep the process alive (e.g. after
  // the HTTP server closes in tests) — stopPoolHealthCheck() still clears it
  // explicitly during a normal graceful shutdown.
  healthCheckTimer.unref();
};

/**
 * Stop the periodic health check (call during shutdown).
 */
export const stopPoolHealthCheck = (): void => {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
    healthCheckTimer = null;
  }
};
