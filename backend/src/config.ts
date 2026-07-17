import { hasText, toPositiveInteger } from './config-helpers.js';
import {
  resolveEnvironment,
  resolveAI,
  resolveAuth,
  resolveStripe,
  resolveRateLimit,
  resolveVocabulary,
  resolveSupabase,
  resolveWorkspace,
} from './config-builders.js';
import type { BackendConfig, RuntimeEnvironment } from '../types.js';

type Env = Record<string, string | undefined>;

export const createBackendConfig = (environment: Env = process.env): BackendConfig => {
  const runtimeEnv = resolveEnvironment(environment);
  const supabase = resolveSupabase(environment);

  return {
    port: toPositiveInteger(environment.PORT, 8787),
    appOrigin: environment.APP_ORIGIN || 'http://localhost:5173',
    environment: runtimeEnv,
    version: environment.APP_VERSION || '4.0.1',
    sentry: {
      dsn: hasText(environment.SENTRY_DSN)
        ? environment.SENTRY_DSN!.trim()
        : null,
      environment: runtimeEnv,
      tracesSampleRate: runtimeEnv === 'production' ? 0.1 : 1.0,
    },
    ai: resolveAI(environment),
    auth: resolveAuth(environment, runtimeEnv),
    stripe: resolveStripe(environment, runtimeEnv),
    supabase,
    vocabulary: resolveVocabulary(environment),
    workspace: resolveWorkspace(environment),
    rateLimit: resolveRateLimit(environment, runtimeEnv),
  };
};

interface HealthCheck {
  configured: boolean;
  reachable?: boolean;
  error?: string;
}

interface PublicHealth {
  ok: boolean;
  status: 'ok' | 'degraded';
  version: string;
  environment: RuntimeEnvironment;
  checks: {
    ai: HealthCheck;
    stripe: HealthCheck;
    supabase: HealthCheck;
    rateLimit: HealthCheck;
    [key: string]: HealthCheck;
  };
  mockMode: boolean;
}

export const toPublicHealth = (config: BackendConfig): PublicHealth => {
  const checks: PublicHealth['checks'] = {
    ai: { configured: config.ai.configured },
    stripe: { configured: config.stripe.configured },
    supabase: { configured: config.supabase.configured },
    rateLimit: { configured: config.rateLimit.storeMode === 'upstash' },
  };

  const allCriticalConfigured =
    config.ai.configured && config.supabase.configured;
  const status = allCriticalConfigured ? 'ok' : 'degraded';

  return {
    ok: status === 'ok',
    status,
    version: config.version,
    environment: config.environment,
    checks,
    mockMode: !config.ai.configured,
  };
};
