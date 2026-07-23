/**
 * Frontend contract for Health API responses.
 * Ensures type safety between backend responses and frontend consumption.
 */

export interface HealthCheckResult {
  ok: boolean;
  status: 'healthy' | 'degraded' | 'blocked';
  appVersion: string;
  environmentMode: string;
  timestamp: string;
  checks: {
    aiBackendConfigured: boolean;
    billingBackendConfigured: boolean;
    supabaseConfigured: boolean;
    errorMonitoringConfigured: boolean;
  };
}

export const isHealthCheckResult = (data: unknown): data is HealthCheckResult =>
  typeof data === 'object' &&
  data !== null &&
  'ok' in data &&
  'status' in data &&
  'checks' in data;
