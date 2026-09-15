/**
 * API endpoint metrics — now delegates to a MetricsRepository for persistence.
 *
 * The repository is set at startup via {@link setMetricsRepository}.
 * Falls back to an in-memory implementation when Supabase is not configured.
 */
import {
  type MetricsRepository,
  createMemoryMetricsRepository,
} from './supabase-metrics-repository.js';

// Consumers (performance-monitor, future repositories) describe themselves in
// terms of the repository contract, so it must stay reachable from here.
export type { MetricsRepository } from './supabase-metrics-repository.js';

type EndpointMetricResult = {
  endpoint: string;
  count: number;
  avgTime: number;
  errorRate: string;
};

let repo: MetricsRepository = createMemoryMetricsRepository();

export const setMetricsRepository = (repository: MetricsRepository): void => {
  repo = repository;
};

export const getMetricsRepository = (): MetricsRepository => repo;

export const recordEndpoint = (
  method: string,
  path: string,
  duration: number,
  isError: boolean
): void => {
  repo.recordEndpoint(method, path, duration, isError);
};

export const getEndpointMetrics = (): EndpointMetricResult[] => repo.getEndpointMetrics();
