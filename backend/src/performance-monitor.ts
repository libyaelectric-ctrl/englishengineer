import type { Request, Response, NextFunction } from 'express';

interface RequestMetric {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: string;
}

interface SystemMetrics {
  startTime: number;
  requestCount: number;
  errorCount: number;
}

interface MetricsState {
  requests: RequestMetric[];
  system: SystemMetrics;
}

const metricsState: MetricsState = {
  requests: [],
  system: {
    startTime: Date.now(),
    requestCount: 0,
    errorCount: 0,
  },
};

export const trackRequest = (
  req: Request,
  res: Response,
  duration: number
): RequestMetric => {
  const metric: RequestMetric = {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration,
    timestamp: new Date().toISOString(),
  };

  metricsState.requests.push(metric);
  metricsState.system.requestCount++;

  if (res.statusCode >= 400) {
    metricsState.system.errorCount++;
  }

  if (metricsState.requests.length > 1000) {
    metricsState.requests = metricsState.requests.slice(-1000);
  }

  return metric;
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

export const getPerformanceMetrics = (): PerformanceMetricsResult => {
  const now = Date.now();
  const uptime = now - metricsState.system.startTime;

  const durations = metricsState.requests.map((r) => r.duration);
  const avgDuration =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

  const p95 =
    durations.length > 0
      ? durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)]
      : 0;

  const p99 =
    durations.length > 0
      ? durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.99)]
      : 0;

  const errorRate =
    metricsState.system.requestCount > 0
      ? (metricsState.system.errorCount / metricsState.system.requestCount) *
        100
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

export const getSlowRequests = (
  thresholdMs: number = 1000
): RequestMetric[] => {
  return metricsState.requests
    .filter((r) => r.duration > thresholdMs)
    .slice(-10)
    .reverse();
};

export const getErrorRate = (): number => {
  if (metricsState.system.requestCount === 0) return 0;
  return (
    (metricsState.system.errorCount / metricsState.system.requestCount) * 100
  );
};

export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] * 1e3 + diff[1] * 1e-6;
    trackRequest(req, res, duration);
  });

  next();
};
