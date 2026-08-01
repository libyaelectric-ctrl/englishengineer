import { type EngVoxEnv, validateEnvironment } from '@/config/environment.config';
import * as Sentry from '@sentry/react';

import { logger } from '@/shared/logger';

import {
  ErrorMonitoringConfig,
  ErrorReport,
  HealthCheckContract,
  HealthStatus,
} from './observability.types';

interface ObservabilityEnv {
  VITE_SENTRY_DSN?: string;
  VITE_ERROR_MONITORING_PROVIDER?: string;
  VITE_ERROR_MONITORING_SAMPLE_RATE?: string;
  VITE_ENVIRONMENT_MODE?: string;
}

const env: ObservabilityEnv | undefined = import.meta.env;

const normalizeSampleRate = (value: string | undefined): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(1, parsed));
};

const getHealthStatus = (errors: string[], warnings: string[]): HealthStatus => {
  if (errors.length > 0) return 'blocked';
  if (warnings.length > 0) return 'degraded';
  return 'healthy';
};

let sentryInitialized = false;

const initSentry = () => {
  if (sentryInitialized) return;
  sentryInitialized = true;

  const dsn = env?.VITE_SENTRY_DSN;
  const sampleRate = normalizeSampleRate(env?.VITE_ERROR_MONITORING_SAMPLE_RATE);

  if (!dsn) {
    logger.d('[Observability] Sentry DSN not configured, skipping initialization.');
    return;
  }

  Sentry.init({
    dsn,
    environment: env?.VITE_ENVIRONMENT_MODE || 'development',
    sampleRate,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend(event) {
      if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
        return null;
      }
      return event;
    },
  });

  logger.i('[Observability] Sentry initialized successfully.');
};

export const ObservabilityService = {
  getErrorMonitoringConfig(): ErrorMonitoringConfig {
    const provider =
      env?.VITE_ERROR_MONITORING_PROVIDER === 'sentry' ? 'sentry-compatible' : 'none';
    const dsnConfigured = Boolean(env?.VITE_SENTRY_DSN);

    return {
      provider,
      configured: provider === 'sentry-compatible' && dsnConfigured,
      dsnConfigured,
      sampleRate: normalizeSampleRate(env?.VITE_ERROR_MONITORING_SAMPLE_RATE),
    };
  },

  getHealthCheck(environmentOverride?: EngVoxEnv): HealthCheckContract {
    const environment = validateEnvironment(environmentOverride);
    const monitoring = this.getErrorMonitoringConfig();
    const notes = [
      ...environment.errors,
      ...environment.warnings,
      monitoring.dsnConfigured
        ? 'Sentry DSN configured and SDK initialized. Errors are reported to Sentry.'
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
          environment.safeConfig.hasSupabaseUrl && environment.safeConfig.hasSupabaseAnonKey,
        errorMonitoringConfigured: monitoring.configured,
      },
      notes,
    };
  },

  /** Initialize Sentry error monitoring. Call once at app startup. */
  init() {
    initSentry();
  },

  /** Report error and log locally. */
  logError(error: ErrorReport): void {
    logger.e(`[Observability] Error: ${error.code}`, error.message, error.context);
    if (sentryInitialized) {
      Sentry.withScope((scope) => {
        scope.setTag('error.code', error.code);
        if (error.context) scope.setExtras(error.context);
        Sentry.captureException(new Error(error.message));
      });
    }
  },

  /** Log performance metric locally. */
  logPerformance(metric: {
    name: string;
    durationMs: number;
    success: boolean;
    context?: Record<string, unknown>;
  }): void {
    logger.i(
      `[Observability] Performance: ${metric.name} took ${metric.durationMs}ms`,
      metric.success ? 'OK' : 'FAILED',
      metric.context
    );
  },
};
