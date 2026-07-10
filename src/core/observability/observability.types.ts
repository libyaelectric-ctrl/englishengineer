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

export interface ErrorReport {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  timestamp?: string;
}
