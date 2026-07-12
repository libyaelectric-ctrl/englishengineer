/**
 * API Metrics Middleware
 * Tracks response times, status codes, and endpoint usage
 */

const endpointMetrics = new Map();

export const apiMetricsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  const endpoint = `${req.method} ${req.route?.path || req.path}`;

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] * 1e3 + diff[1] * 1e-6;

    if (!endpointMetrics.has(endpoint)) {
      endpointMetrics.set(endpoint, {
        count: 0,
        totalTime: 0,
        errors: 0,
        p95: [],
        p99: [],
      });
    }

    const metrics = endpointMetrics.get(endpoint);
    metrics.count++;
    metrics.totalTime += duration;

    if (res.statusCode >= 400) {
      metrics.errors++;
    }

    // Track percentiles
    metrics.p95.push(duration);
    if (metrics.p95.length > 100) {
      metrics.p95.sort((a, b) => a - b);
      metrics.p95 = metrics.p95.slice(0, 95);
    }
  });

  next();
};

export const getEndpointMetrics = () => {
  const results = [];

  for (const [endpoint, metrics] of endpointMetrics.entries()) {
    const avgTime = metrics.count > 0 ? metrics.totalTime / metrics.count : 0;
    const errorRate =
      metrics.count > 0 ? (metrics.errors / metrics.count) * 100 : 0;

    results.push({
      endpoint,
      count: metrics.count,
      avgTime: Math.round(avgTime),
      errorRate: errorRate.toFixed(2) + '%',
    });
  }

  return results.sort((a, b) => b.count - a.count);
};

export const getSlowEndpoints = (thresholdMs = 500) => {
  return getEndpointMetrics()
    .filter((e) => e.avgTime > thresholdMs)
    .sort((a, b) => b.avgTime - a.avgTime);
};

export const getErrorProneEndpoints = (thresholdPercent = 5) => {
  return getEndpointMetrics()
    .filter((e) => parseFloat(e.errorRate) > thresholdPercent)
    .sort((a, b) => parseFloat(b.errorRate) - parseFloat(a.errorRate));
};

export const resetMetrics = () => {
  endpointMetrics.clear();
};
