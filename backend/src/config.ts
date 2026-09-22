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
import { rateLimitStoreCheck, supabaseStoreCheck } from './store-health.js';

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
  /**
   * Whether this service's inbound webhook path can accept a delivery at all.
   *
   * `configured` answers a different question — can the service be called out to — and the
   * two came apart in production: billing reported `configured: true` while every Dodo
   * webhook delivery was refused with 503 `dodo_webhook_not_configured`, so the provider
   * charged the customer and the plan never activated. A boolean only, like every other
   * secret-derived field here: the value itself never leaves the process.
   */
  webhookConfigured?: boolean;
  /**
   * `null` means this endpoint did not probe the store — the liveness endpoint never pays
   * for a round trip, and says so instead of implying a healthy store. Only a probe writes
   * `true` or `false`; see `store-health.ts` for the single implementation both endpoints
   * report from.
   */
  reachable?: boolean | null;
  error?: string;
  firebaseProjectId?: string | null;
  /** Which Supabase project this process resolves to (`store-health.ts`). */
  projectRef?: string | null;
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
      // Reported separately from `configured` on purpose: a provider whose webhook signing
      // secret is missing can still start a checkout, and that is exactly the state that
      // takes a customer's money without granting the plan. Callers that only look at
      // `configured` would call that healthy.
      webhookConfigured:
        config.billing.provider === 'dodo'
          ? hasText(config.dodo.webhookSecret)
          : config.billing.provider === 'paddle'
            ? false
            : hasText(config.stripe.webhookSecret),
    },
    // Both store checks come from the module `/api/diagnostics` also reports from, so the
    // two endpoints cannot describe different databases or different configurations.
    supabase: supabaseStoreCheck(config),
    rateLimit: rateLimitStoreCheck(config),
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
