import type { Request, Response, NextFunction } from 'express';

interface EndpointMetricData {
  count: number;
  totalTime: number;
  errors: number;
  p95: number[];
  p99: number[];
}

interface EndpointMetricResult {
  endpoint: string;
  count: number;
  avgTime: number;
  errorRate: string;
}

const endpointMetrics = new Map<string, EndpointMetricData>();

export const apiMetricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = process.hrtime();
  const endpoint = `${req.method} ${(req as { route?: { path?: string } }).route?.path || req.path}`;

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

    const metricData = endpointMetrics.get(endpoint)!;
    metricData.count++;
    metricData.totalTime += duration;

    if (res.statusCode >= 400) {
      metricData.errors++;
    }

    metricData.p95.push(duration);
    if (metricData.p95.length > 100) {
      metricData.p95.sort((a, b) => a - b);
      metricData.p95 = metricData.p95.slice(0, 95);
    }
  });

  next();
};

export const getEndpointMetrics = (): EndpointMetricResult[] => {
  const results: EndpointMetricResult[] = [];

  for (const [endpoint, metricData] of endpointMetrics.entries()) {
    const avgTime =
      metricData.count > 0 ? metricData.totalTime / metricData.count : 0;
    const errorRate =
      metricData.count > 0 ? (metricData.errors / metricData.count) * 100 : 0;

    results.push({
      endpoint,
      count: metricData.count,
      avgTime: Math.round(avgTime),
      errorRate: errorRate.toFixed(2) + '%',
    });
  }

  return results.sort((a, b) => b.count - a.count);
};

export const getSlowEndpoints = (
  thresholdMs: number = 500
): EndpointMetricResult[] => {
  return getEndpointMetrics()
    .filter((e) => e.avgTime > thresholdMs)
    .sort((a, b) => b.avgTime - a.avgTime);
};

export const getErrorProneEndpoints = (
  thresholdPercent: number = 5
): EndpointMetricResult[] => {
  return getEndpointMetrics()
    .filter((e) => parseFloat(e.errorRate) > thresholdPercent)
    .sort((a, b) => parseFloat(b.errorRate) - parseFloat(a.errorRate));
};

export const resetMetrics = (): void => {
  endpointMetrics.clear();
};
