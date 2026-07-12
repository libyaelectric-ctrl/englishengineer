/**
 * Performance Monitoring Service
 * Tracks API response times, memory usage, and system health
 */

const metrics = {
  requests: [],
  system: {
    startTime: Date.now(),
    requestCount: 0,
    errorCount: 0,
  },
};

export const trackRequest = (req, res, duration) => {
  const metric = {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration,
    timestamp: new Date().toISOString(),
  };

  metrics.requests.push(metric);
  metrics.system.requestCount++;

  if (res.statusCode >= 400) {
    metrics.system.errorCount++;
  }

  // Keep only last 1000 requests
  if (metrics.requests.length > 1000) {
    metrics.requests = metrics.requests.slice(-1000);
  }

  return metric;
};

export const getPerformanceMetrics = () => {
  const now = Date.now();
  const uptime = now - metrics.system.startTime;

  const durations = metrics.requests.map((r) => r.duration);
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
    metrics.system.requestCount > 0
      ? (metrics.system.errorCount / metrics.system.requestCount) * 100
      : 0;

  return {
    uptime,
    requestCount: metrics.system.requestCount,
    errorCount: metrics.system.errorCount,
    errorRate: errorRate.toFixed(2) + '%',
    avgDuration: Math.round(avgDuration),
    p95Duration: Math.round(p95),
    p99Duration: Math.round(p99),
    memoryUsage: process.memoryUsage(),
  };
};

export const getSlowRequests = (thresholdMs = 1000) => {
  return metrics.requests
    .filter((r) => r.duration > thresholdMs)
    .slice(-10)
    .reverse();
};

export const getErrorRate = () => {
  if (metrics.system.requestCount === 0) return 0;
  return (metrics.system.errorCount / metrics.system.requestCount) * 100;
};

// Middleware for automatic tracking
export const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] * 1e3 + diff[1] * 1e-6;
    trackRequest(req, res, duration);
  });

  next();
};
