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
  reachable?: boolean;
  error?: string;
  firebaseProjectId?: string | null;
  /**
   * Which Supabase project this process resolves to.
   *
   * `configured` and `reachable` answer "is there a database and does it answer"
   * — never "which one". That gap had a cost: this deployment had two Supabase
   * projects with the same tables, so a migration applied to the one the
   * dashboard opens by default reported success while the running backend kept
   * failing against the other, and nothing outside the process could tell the
   * two apart. A project ref is public (it is in the frontend's own bundle and
   * in every dashboard URL), so it can be reported like `firebaseProjectId`
   * already is, and it makes the comparison one request instead of a guess.
   * Null when nothing is configured or the URL is not a hosted project URL.
   */
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

/**
 * The project ref behind the Supabase URL this process uses.
 *
 * The audit and billing stores are resolved from `workspace`, the auth client
 * from `auth`; both come from the same `SUPABASE_URL`, and the workspace one is
 * preferred because it is where the data actually goes. Anything that is not a
 * hosted project URL — a self-hosted PostgREST, a custom domain — has no ref to
 * name and reports null rather than a guess.
 */
export const supabaseProjectRef = (config: BackendConfig): string | null => {
  const raw = config.workspace?.supabaseUrl ?? config.auth?.supabaseUrl;
  if (!raw) return null;
  const match = /^https?:\/\/([a-z0-9]{20})\.supabase\.(?:co|in)/i.exec(raw.trim());
  return match ? match[1] : null;
};

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
    supabase: { configured: config.supabase.configured, projectRef: supabaseProjectRef(config) },
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
