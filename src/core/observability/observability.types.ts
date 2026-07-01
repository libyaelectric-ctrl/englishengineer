export type HealthStatus = 'healthy' | 'degraded' | 'blocked';

export interface HealthCheckContract {
  appVersion: string;
  environmentMode: string;
  status: HealthStatus;
  generatedAt: string;
  checks: {
    aiBackendConfigured: boolean;
    billingBackendConfigured: boolean;
    supabaseConfigured: boolean;
    errorMonitoringConfigured: boolean;
  };
  notes: string[];
}

export interface ErrorMonitoringConfig {
  provider: 'none' | 'sentry-compatible';
  configured: boolean;
  dsnConfigured: boolean;
  sampleRate: number;
}
