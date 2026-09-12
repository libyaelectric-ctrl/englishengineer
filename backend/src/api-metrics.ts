/**
 * API endpoint metrics — now delegates to a MetricsRepository for persistence.
 *
 * The repository is set at startup via {@link setMetricsRepository}.
 * Falls back to an in-memory implementation when Supabase is not configured.
 */
import { createMemoryMetricsRepository, type MetricsRepository } from './supabase-metrics-repository.js';

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
  isError: boolean,
): void => {
  repo.recordEndpoint(method, path, duration, isError);
};

export const getEndpointMetrics = (): EndpointMetricResult[] =>
  repo.getEndpointMetrics();
