import type { BackendConfig, RuntimeEnvironment } from '../types.js';
import {
  resolveAI,
  resolveAuth,
  resolveBilling,
  resolveDodo,
  resolveEnvironment,
  resolveRateLimit,
  resolveStripe,
  resolveSupabase,
  resolveVocabulary,
  resolveWorkspace,
} from './config-builders.js';
import { hasText, toPositiveInteger } from './config-helpers.js';

type Env = Record<string, string | undefined>;

export const createBackendConfig = (environment: Env = process.env): BackendConfig => {
  const runtimeEnv = resolveEnvironment(environment);
  const supabase = resolveSupabase(environment);

  return {
    port: toPositiveInteger(environment.PORT, 8787),
    appOrigin: environment.APP_ORIGIN || 'http://localhost:3000',
    environment: runtimeEnv,
    version: environment.APP_VERSION || '4.0.22',
    corsAllowedOrigins: hasText(environment.CORS_ALLOWED_ORIGINS)
      ? environment
          .CORS_ALLOWED_ORIGINS!.split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
      : [],
    sentry: {
      dsn: hasText(environment.SENTRY_DSN) ? environment.SENTRY_DSN!.trim() : null,
      environment: runtimeEnv,
      tracesSampleRate: runtimeEnv === 'production' ? 0.1 : 1.0,
    },
    ai: resolveAI(environment),
    auth: resolveAuth(environment, runtimeEnv),
    billing: resolveBilling(environment),
    dodo: resolveDodo(environment),
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
  firebaseProjectId?: string | null;
}

interface PublicHealth {
  ok: boolean;
  status: 'ok' | 'degraded';
  version: string;
  environment: RuntimeEnvironment;
  checks: {
    ai: HealthCheck;
    billing: HealthCheck;
    supabase: HealthCheck;
    rateLimit: HealthCheck;
    auth: HealthCheck;
    [key: string]: HealthCheck;
  };
  mockMode: boolean;
}

export const toPublicHealth = (config: BackendConfig): PublicHealth => {
  // firebaseProjectId is not a secret — it's already public in the
  // frontend's own bundle/.env.production and in every Firebase console
  // URL — so exposing it here (unlike a real secret) is safe and lets
  // anyone directly compare "does the live backend's configured project
  // match the frontend's project" without needing dashboard access to the
  // hosting provider's environment variables. Secret material (JWT
  // secrets, service keys) stays booleans only, never here.
  const firebaseConfigured = Boolean(config.auth?.firebaseProjectId);
  const supabaseAuthConfigured = Boolean(
    config.auth?.supabaseJwtSecret || (config.auth?.supabaseUrl && config.auth?.supabaseAnonKey)
  );
  const checks: PublicHealth['checks'] = {
    ai: { configured: config.ai.configured },
    billing: {
      configured:
        config.billing.provider === 'dodo'
          ? config.dodo.configured
          : config.billing.provider === 'paddle'
            ? false
            : config.stripe.configured,
    },
    supabase: { configured: config.supabase.configured },
    rateLimit: { configured: config.rateLimit.storeMode === 'upstash' },
    auth: {
      configured: firebaseConfigured || supabaseAuthConfigured,
      firebaseProjectId: config.auth?.firebaseProjectId || null,
    },
  };

  const allCriticalConfigured = config.ai.configured && config.supabase.configured;
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
