import {
  type EngineerOSEnv,
  validateEnvironment,
} from '@/config/environment.config';
import {
  ErrorMonitoringConfig,
  HealthCheckContract,
  HealthStatus,
} from './observability.types';

interface ObservabilityEnv {
  VITE_SENTRY_DSN?: string;
  VITE_ERROR_MONITORING_PROVIDER?: string;
  VITE_ERROR_MONITORING_SAMPLE_RATE?: string;
}

interface ImportMetaWithObservabilityEnv {
  env?: ObservabilityEnv;
}

const env = (import.meta as unknown as ImportMetaWithObservabilityEnv).env;

const normalizeSampleRate = (value: string | undefined): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(1, parsed));
};

const getHealthStatus = (
  errors: string[],
  warnings: string[]
): HealthStatus => {
  if (errors.length > 0) return 'blocked';
  if (warnings.length > 0) return 'degraded';
  return 'healthy';
};

export const ObservabilityService = {
  getErrorMonitoringConfig(): ErrorMonitoringConfig {
    const provider =
      env?.VITE_ERROR_MONITORING_PROVIDER === 'sentry'
        ? 'sentry-compatible'
        : 'none';
    const dsnConfigured = Boolean(env?.VITE_SENTRY_DSN);

    return {
      provider,
      configured: provider === 'sentry-compatible' && dsnConfigured,
      dsnConfigured,
      sampleRate: normalizeSampleRate(env?.VITE_ERROR_MONITORING_SAMPLE_RATE),
    };
  },

  getHealthCheck(environmentOverride?: EngineerOSEnv): HealthCheckContract {
    const environment = validateEnvironment(environmentOverride);
    const monitoring = this.getErrorMonitoringConfig();
    const notes = [
      ...environment.errors,
      ...environment.warnings,
      monitoring.configured
        ? 'Error monitoring is configured.'
        : 'Error monitoring is not configured. Runtime errors remain local-only.',
    ];

    return {
      appVersion: environment.safeConfig.appVersion,
      environmentMode: environment.mode,
      status: getHealthStatus(environment.errors, environment.warnings),
      generatedAt: new Date().toISOString(),
      checks: {
        aiBackendConfigured: environment.safeConfig.hasAiProxyUrl,
        billingBackendConfigured: environment.safeConfig.hasBillingApiUrl,
        supabaseConfigured:
          environment.safeConfig.hasSupabaseUrl &&
          environment.safeConfig.hasSupabaseAnonKey,
        errorMonitoringConfigured: monitoring.configured,
      },
      notes,
    };
  },
};
