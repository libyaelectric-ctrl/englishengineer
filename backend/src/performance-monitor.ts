interface RequestMetric {
  duration: number;
}

interface RateLimitMetric {
  scope: string;
  blocked: boolean;
  timestamp: number;
}

interface SystemMetrics {
  startTime: number;
  requestCount: number;
  errorCount: number;
}

interface MetricsState {
  requests: RequestMetric[];
  rateLimits: RateLimitMetric[];
  system: SystemMetrics;
}

const MAX_REQUESTS = 1000;
const MAX_RATE_LIMIT_ENTRIES = 500;

const metricsState: MetricsState = {
  requests: [],
  rateLimits: [],
  system: {
    startTime: Date.now(),
    requestCount: 0,
    errorCount: 0,
  },
};

interface PerformanceMetricsResult {
  uptime: number;
  requestCount: number;
  errorCount: number;
  errorRate: string;
  avgDuration: number;
  p95Duration: number;
  p99Duration: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export const recordRequest = (duration: number, isError: boolean): void => {
  metricsState.requests.push({ duration });
  if (metricsState.requests.length > MAX_REQUESTS) {
    metricsState.requests = metricsState.requests.slice(-MAX_REQUESTS);
  }
  metricsState.system.requestCount++;
  if (isError) metricsState.system.errorCount++;
};

export const getPerformanceMetrics = (): PerformanceMetricsResult => {
  const now = Date.now();
  const uptime = now - metricsState.system.startTime;

  const durations = metricsState.requests.map((r) => r.duration);
  const avgDuration =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  const sorted = [...durations].sort((a, b) => a - b);
  const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
  const p99 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] : 0;

  const errorRate =
    metricsState.system.requestCount > 0
      ? (metricsState.system.errorCount / metricsState.system.requestCount) * 100
      : 0;

  return {
    uptime,
    requestCount: metricsState.system.requestCount,
    errorCount: metricsState.system.errorCount,
    errorRate: errorRate.toFixed(2) + '%',
    avgDuration: Math.round(avgDuration),
    p95Duration: Math.round(p95),
    p99Duration: Math.round(p99),
    memoryUsage: process.memoryUsage(),
  };
};

export const recordRateLimit = (scope: string, blocked: boolean): void => {
  metricsState.rateLimits.push({ scope, blocked, timestamp: Date.now() });
  if (metricsState.rateLimits.length > MAX_RATE_LIMIT_ENTRIES) {
    metricsState.rateLimits = metricsState.rateLimits.slice(-MAX_RATE_LIMIT_ENTRIES);
  }
};

export const getRateLimitMetrics = (): {
  totalRequests: number;
  blockedRequests: number;
  blockRate: string;
  byScope: Record<string, { total: number; blocked: number }>;
  recentBlocks: Array<{ scope: string; timestamp: number }>;
} => {
  const total = metricsState.rateLimits.length;
  const blocked = metricsState.rateLimits.filter((r) => r.blocked).length;
  const blockRate = total > 0 ? ((blocked / total) * 100).toFixed(2) + '%' : '0%';

  const byScope: Record<string, { total: number; blocked: number }> = {};
  for (const entry of metricsState.rateLimits) {
    if (!byScope[entry.scope]) {
      byScope[entry.scope] = { total: 0, blocked: 0 };
    }
    byScope[entry.scope].total++;
    if (entry.blocked) byScope[entry.scope].blocked++;
  }

  const recentBlocks = metricsState.rateLimits
    .filter((r) => r.blocked)
    .slice(-20)
    .map(({ scope, timestamp }) => ({ scope, timestamp }));

  return { totalRequests: total, blockedRequests: blocked, blockRate, byScope, recentBlocks };
};
