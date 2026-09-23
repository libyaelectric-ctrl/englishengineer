import { logger } from './logger.js';

/**
 * The store checks both health endpoints report, in one place.
 *
 * `/api/health` and `/api/diagnostics` used to build `checks.supabase` and
 * `checks.rateLimit` in two different modules: `toPublicHealth` (config.ts) wrote the cheap
 * identity, and the diagnostics handler in `app.ts` wrote a probed object with its own keys
 * and its own degrade logic. That split is how the two came to disagree in production —
 * `/api/health` reported `supabase.configured: true` while every query against the store was
 * being refused, and neither payload said *which* database was being described.
 *
 * The checks now live here, in one shape:
 *
 *   - `reachable: null` means "this endpoint did not probe" — liveness stays cheap;
 *   - `reachable: true | false` is only ever written by a probe below;
 *   - `hasStoreOutage` is the single place that turns a probe result into `degraded`.
 *
 * A consumer therefore reads the same keys from either endpoint, and can tell "not checked
 * yet" from "checked and down" without knowing which endpoint it called.
 */

/** The subset of the backend config these checks read. Structural, so config.ts can import this. */
export interface StoreConfigView {
  supabase?: { configured?: boolean; expectedProjectRef?: string | null } | undefined;
  workspace?: { supabaseUrl?: string | null; supabaseServiceRoleKey?: string | null } | undefined;
  stripe?: { supabaseUrl?: string | null; supabaseServiceRoleKey?: string | null } | undefined;
  auth?: { supabaseUrl?: string | null } | undefined;
  rateLimit?:
    { storeMode?: string; upstashUrl?: string | null; upstashToken?: string | null } | undefined;
}

/**
 * The verdict of comparing the project this process resolved with the one the deployment says
 * it must be on.
 *
 * `matches: null` means nothing is pinned, so no comparison happened — the same convention as
 * `reachable: null`, and for the same reason: a value that was never computed must not read
 * as a passing one.
 */
export interface ProjectRefPin {
  expected: string | null;
  actual: string | null;
  matches: boolean | null;
}

export interface SupabaseStoreCheck {
  configured: boolean;
  /**
   * Which Supabase project this process resolves to.
   *
   * `configured` and `reachable` answer "is there a database and does it answer" — never
   * "which one". That gap had a cost: this deployment had two Supabase projects with the
   * same tables, so a migration applied to the one the dashboard opens by default reported
   * success while the running backend kept failing against the other, and nothing outside
   * the process could tell the two apart. A project ref is public (it is in the frontend's
   * own bundle and in every dashboard URL), so it can be reported like `firebaseProjectId`
   * already is. Null when nothing is configured or the URL is not a hosted project URL.
   */
  projectRef: string | null;
  /**
   * The project ref this deployment pinned in `EXPECTED_SUPABASE_PROJECT_REF`, if any.
   *
   * Without a pin, "is there a database and does it answer" is the only question either
   * endpoint can answer, and a service pointed at the wrong project with the same tables
   * answers exactly like a correct one. The pin makes the intended project a fact the
   * service can check itself, so a misdirected migration is a startup error instead of a
   * silently divided brain.
   */
  expectedProjectRef: string | null;
  /** `null` until a probe runs — the liveness endpoint deliberately never pays for one. */
  reachable: boolean | null;
  error?: string;
}

export interface RateLimitStoreCheck {
  configured: boolean;
  reachable: boolean | null;
  error?: string;
}

export interface StoreChecks {
  supabase: SupabaseStoreCheck;
  rateLimit: RateLimitStoreCheck;
}

const DEFAULT_PROBE_TIMEOUT_MS = 5000;

/**
 * The project ref behind the Supabase URL this process uses.
 *
 * The audit and billing stores are resolved from `workspace`, the auth client from `auth`;
 * both come from the same `SUPABASE_URL`, and the workspace one is preferred because it is
 * where the data actually goes. Anything that is not a hosted project URL — a self-hosted
 * PostgREST, a custom domain — has no ref to name and reports null rather than a guess.
 */
export const supabaseProjectRef = (config: StoreConfigView): string | null => {
  const raw = config.workspace?.supabaseUrl ?? config.auth?.supabaseUrl;
  if (!raw) return null;
  const match = /^https?:\/\/([a-z0-9]{20})\.supabase\.(?:co|in)/i.exec(raw.trim());
  return match ? match[1] : null;
};

/**
 * The URL and key the probe should use, in preference order.
 *
 * Workspace is where the runtime's data goes; the billing config carries the same key. Both
 * are preferred over the auth client, which is anon-keyed and cannot select from the tables
 * this service writes (RLS revokes them from every browser role).
 */
export const supabaseProbeTarget = (
  config: StoreConfigView
): { url: string | null; key: string | null } => ({
  url: config.workspace?.supabaseUrl ?? config.stripe?.supabaseUrl ?? null,
  key: config.workspace?.supabaseServiceRoleKey ?? config.stripe?.supabaseServiceRoleKey ?? null,
});

/**
 * The cheap half of the Supabase check: what this process is pointed at, no I/O.
 * This is the object `/api/health` embeds, so a liveness ping costs no database round trip.
 */
/**
 * Compares the resolved project with the pinned one. Pure, so boot can use the verdict and a
 * test can drive both halves without a network.
 */
export const projectRefPin = (config: StoreConfigView): ProjectRefPin => {
  const expected = config.supabase?.expectedProjectRef?.trim().toLowerCase() || null;
  const actual = supabaseProjectRef(config);
  return { expected, actual, matches: expected ? actual === expected : null };
};

export const supabaseStoreCheck = (config: StoreConfigView): SupabaseStoreCheck => ({
  configured: config.supabase?.configured === true,
  projectRef: supabaseProjectRef(config),
  expectedProjectRef: projectRefPin(config).expected,
  reachable: null,
});

/** The cheap half of the rate-limit check. The Upstash host is not reported: it is not public. */
export const rateLimitStoreCheck = (config: StoreConfigView): RateLimitStoreCheck => ({
  configured: config.rateLimit?.storeMode === 'upstash',
  reachable: null,
});

/**
 * The table this probe reads. It has to be a table a migration actually creates, and one the
 * runtime depends on, so that "the store answered" means "the store this service uses
 * answered". `subscription_status` is both: it is written on every checkout and webhook, and
 * the billing repository reads it by `user_id`.
 */
export const SUPABASE_PROBE_TABLE = 'subscription_status';

/**
 * Probes the Supabase store in a way that is capable of failing.
 *
 * Two things used to make this check report `reachable: true` for a store that was refusing
 * every query, and both are corrected here:
 *
 *   1. It read `from('subscriptions')` — a table no migration creates. The real billing table
 *      is `subscription_status`, so PostgREST answered 404 to every probe.
 *   2. **supabase-js does not reject on an HTTP failure.** It *resolves* with
 *      `{ data: null, error }`, so awaiting the promise and never reading `error` turned a
 *      404 (or a 401, or a `42P01`) into a healthy report. That is the same silent-success
 *      shape that hid the billing outage — a boolean nobody could contradict.
 *
 * The probe therefore runs against the credentials the runtime actually writes with (the
 * service-role key, not the anon key, because `subscription_status` is revoked from every
 * browser role by RLS), inspects `error`, and treats a timeout as a failure. `fetch` and the
 * timeout are injected so a test can drive the probe — including the timeout path — without
 * touching the network or waiting five seconds.
 *
 * A store that is not configured at all keeps `reachable: null`: there is nothing to probe,
 * and `configured` already says so.
 */
export const probeSupabaseStore = async (
  config: StoreConfigView,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {}
): Promise<SupabaseStoreCheck> => {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_PROBE_TIMEOUT_MS;
  const identity = supabaseStoreCheck(config);
  const { url, key } = supabaseProbeTarget(config);

  if (!identity.configured) return identity;

  const unreachable = (error: string): SupabaseStoreCheck => ({
    ...identity,
    reachable: false,
    error,
  });

  if (!url || !key) {
    return unreachable('Supabase is configured without a URL and service-role key to probe.');
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchImpl },
    });
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Supabase health check timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });
    const probe = client.from(SUPABASE_PROBE_TABLE).select('user_id').limit(1);
    // `error` is the whole point: a resolved promise here is not a working store.
    const { error } = await Promise.race([probe, timeoutPromise]);
    if (error) throw new Error(`${SUPABASE_PROBE_TABLE}: ${error.message}`);
    return { ...identity, reachable: true };
  } catch (err: unknown) {
    return unreachable(err instanceof Error ? err.message : String(err));
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/**
 * Probes the rate-limit store the same way: one request, an inspected status, a bounded wait.
 * Unconfigured or memory-mode installs have nothing to reach and keep `reachable: null`.
 */
export const probeRateLimitStore = async (
  config: StoreConfigView,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {}
): Promise<RateLimitStoreCheck> => {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_PROBE_TIMEOUT_MS;
  const identity = rateLimitStoreCheck(config);
  const url = config.rateLimit?.upstashUrl;
  const token = config.rateLimit?.upstashToken;

  if (!identity.configured || !url) return identity;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Rate-limit store timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });
    const ping = fetchImpl(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token ?? ''}` },
    });
    const response = await Promise.race([ping, timeout]);
    return response.ok
      ? { ...identity, reachable: true }
      : {
          ...identity,
          reachable: false,
          error: `Rate-limit store answered HTTP ${response.status}`,
        };
  } catch (err: unknown) {
    const check: RateLimitStoreCheck = {
      ...identity,
      reachable: false,
      error: err instanceof Error ? err.message : String(err),
    };
    logger.warn('Rate-limit store probe failed', { error: check.error });
    return check;
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/**
 * Runs both checks, probing only when asked.
 *
 * `probe: false` performs no I/O by construction, which is what keeps `/api/health` cheap
 * while still reporting the same identity keys the diagnostics endpoint reports.
 */
export const collectStoreChecks = async (
  config: StoreConfigView,
  options: { probe: boolean; fetchImpl?: typeof fetch; timeoutMs?: number } = { probe: false }
): Promise<StoreChecks> => {
  const { probe, fetchImpl, timeoutMs } = options;
  if (!probe) {
    return { supabase: supabaseStoreCheck(config), rateLimit: rateLimitStoreCheck(config) };
  }
  return {
    supabase: await probeSupabaseStore(config, { fetchImpl, timeoutMs }),
    rateLimit: await probeRateLimitStore(config, { fetchImpl, timeoutMs }),
  };
};

/**
 * The one place a probed result becomes a degraded report.
 *
 * `reachable: null` (not probed) is not an outage: only a probe that ran and failed counts,
 * so a caller can never degrade a report over a check it never performed.
 */
export const hasStoreOutage = (checks: StoreChecks): boolean =>
  checks.supabase.reachable === false || checks.rateLimit.reachable === false;
