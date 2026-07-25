import { getPerformanceMetrics } from './performance-monitor.js';
import { getEndpointMetrics } from './api-metrics.js';

/**
 * Prometheus-compatible metrics endpoint.
 * Returns metrics in Prometheus text exposition format.
 */
export const getPrometheusMetrics = (): string => {
  const perf = getPerformanceMetrics();
  const endpoints = getEndpointMetrics();

  const lines: string[] = [];

  // System metrics
  lines.push('# HELP engineeros_uptime_seconds Application uptime in seconds');
  lines.push('# TYPE engineeros_uptime_seconds gauge');
  lines.push(`engineeros_uptime_seconds ${Math.floor(perf.uptime / 1000)}`);

  lines.push('# HELP engineeros_requests_total Total number of requests');
  lines.push('# TYPE engineeros_requests_total counter');
  lines.push(`engineeros_requests_total ${perf.requestCount}`);

  lines.push('# HELP engineeros_errors_total Total number of errors');
  lines.push('# TYPE engineeros_errors_total counter');
  lines.push(`engineeros_errors_total ${perf.errorCount}`);

  lines.push('# HELP engineeros_error_rate_percent Error rate percentage');
  lines.push('# TYPE engineeros_error_rate_percent gauge');
  lines.push(`engineeros_error_rate_percent ${perf.errorRate}`);

  lines.push('# HELP engineeros_request_duration_avg_ms Average request duration in milliseconds');
  lines.push('# TYPE engineeros_request_duration_avg_ms gauge');
  lines.push(`engineeros_request_duration_avg_ms ${perf.avgDuration}`);

  lines.push('# HELP engineeros_request_duration_p95_ms 95th percentile request duration');
  lines.push('# TYPE engineeros_request_duration_p95_ms gauge');
  lines.push(`engineeros_request_duration_p95_ms ${perf.p95Duration}`);

  lines.push('# HELP engineeros_request_duration_p99_ms 99th percentile request duration');
  lines.push('# TYPE engineeros_request_duration_p99_ms gauge');
  lines.push(`engineeros_request_duration_p99_ms ${perf.p99Duration}`);

  // Memory metrics
  const mem = perf.memoryUsage;
  lines.push('# HELP engineeros_memory_rss_bytes Resident set size in bytes');
  lines.push('# TYPE engineeros_memory_rss_bytes gauge');
  lines.push(`engineeros_memory_rss_bytes ${mem.rss}`);

  lines.push('# HELP engineeros_memory_heap_used_bytes Heap used in bytes');
  lines.push('# TYPE engineeros_memory_heap_used_bytes gauge');
  lines.push(`engineeros_memory_heap_used_bytes ${mem.heapUsed}`);

  lines.push('# HELP engineeros_memory_heap_total_bytes Heap total in bytes');
  lines.push('# TYPE engineeros_memory_heap_total_bytes gauge');
  lines.push(`engineeros_memory_heap_total_bytes ${mem.heapTotal}`);

  lines.push('# HELP engineeros_memory_external_bytes External memory in bytes');
  lines.push('# TYPE engineeros_memory_external_bytes gauge');
  lines.push(`engineeros_memory_external_bytes ${mem.external}`);

  // Endpoint metrics
  if (endpoints.length > 0) {
    lines.push('# HELP engineeros_endpoint_requests_total Requests per endpoint');
    lines.push('# TYPE engineeros_endpoint_requests_total counter');

    for (const ep of endpoints) {
      const labels = `endpoint="${ep.endpoint.replace(/"/g, '\\"')}"`;
      lines.push(`engineeros_endpoint_requests_total{${labels}} ${ep.count}`);
    }

    lines.push('# HELP engineeros_endpoint_avg_duration_ms Average duration per endpoint');
    lines.push('# TYPE engineeros_endpoint_avg_duration_ms gauge');

    for (const ep of endpoints) {
      const labels = `endpoint="${ep.endpoint.replace(/"/g, '\\"')}"`;
      lines.push(`engineeros_endpoint_avg_duration_ms{${labels}} ${ep.avgTime}`);
    }
  }

  return lines.join('\n') + '\n';
};
