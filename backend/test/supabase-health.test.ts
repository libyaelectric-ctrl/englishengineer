import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { createApp } from '../src/app.js';
import { createBackendConfig, toPublicHealth } from '../src/config.js';
import {
  collectStoreChecks,
  hasStoreOutage,
  probeRateLimitStore,
  probeSupabaseStore,
  supabaseStoreCheck,
} from '../src/store-health.js';
import type { StoreConfigView } from '../src/store-health.js';

/**
 * The regression this file exists for: `/api/diagnostics` reported `checks.supabase.reachable:
 * true` for a store that was refusing every query, so a real repository outage had no signal
 * anywhere. Two mistakes produced that, and both are asserted against below:
 *
 *   - the probe read a table no migration creates (`subscriptions`), so PostgREST answered
 *     404 on every run;
 *   - supabase-js *resolves* with `{ error }` instead of rejecting on an HTTP failure, and the
 *     old code never read `error` — a resolved promise was treated as a healthy store.
 *
 * A test that only asserted "a 200 is reachable" would have passed against the broken probe,
 * which is why the cases below drive an error and a non-answer, and pin the table and the
 * credential the probe is allowed to use.
 *
 * The second half covers the other half of the same fault: `/api/health` and
 * `/api/diagnostics` described `checks.supabase` from two separate code paths, so one could
 * report a configured store while the other reported a dead one. They now share a producer,
 * and the cases below assert the shared keys are identical and only `reachable` differs.
 */

const SERVICE_ROLE_KEY = 'test-service-role-key';
const ANON_KEY = 'test-anon-key';
const SUPABASE_URL = 'https://abcdefghijklmnopqrst.supabase.co';
const PROJECT_REF = 'abcdefghijklmnopqrst';

const config = {
  version: '4.0.1',
  environment: 'test',
  ai: { configured: true },
  billing: { provider: 'dodo', configured: true },
  dodo: { configured: true, webhookSecret: 'whsec_test' },
  stripe: { configured: false },
  supabase: { configured: true },
  rateLimit: { storeMode: 'memory' },
  // The runtime writes billing state with the service-role key; the auth client is anon-keyed
  // and cannot even select from `subscription_status` (RLS revokes it from browser roles).
  workspace: {
    configured: true,
    supabaseUrl: SUPABASE_URL,
    supabaseServiceRoleKey: SERVICE_ROLE_KEY,
  },
  auth: { firebaseProjectId: 'demo-project', supabaseUrl: SUPABASE_URL, supabaseAnonKey: ANON_KEY },
} as unknown as StoreConfigView;

const jsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'content-range': '0-0/0' },
  });

interface RecordedRequest {
  url: string;
  headers: Record<string, string>;
}

const createFetch = (responder: (url: string) => Promise<Response> | Response) => {
  const calls: RecordedRequest[] = [];
  const impl = (async (input: string | URL | Request, init?: RequestInit) => {
    // Normalized, because supabase-js may hand the injected fetch either a plain object or a
    // `Headers` instance, and the assertion below must not depend on which.
    const headers = Object.fromEntries(new Headers(init?.headers).entries());
    calls.push({ url: String(input), headers });
    return responder(String(input));
  }) as unknown as typeof fetch;
  return { impl, calls };
};

describe('diagnostics Supabase probe', () => {
  it('reports a store that answers as reachable', async () => {
    const { impl } = createFetch(() => jsonResponse([], 200));

    const check = await probeSupabaseStore(config, { fetchImpl: impl });

    assert.equal(check.reachable, true);
    assert.equal(check.projectRef, PROJECT_REF);
    assert.equal(check.configured, true);
  });

  it('reports a PostgREST error as unreachable instead of swallowing it', async () => {
    // The exact shape PostgREST returns for a table that does not exist: supabase-js resolves
    // with this as `error` and never rejects, which is how the outage stayed invisible.
    const { impl } = createFetch(() =>
      jsonResponse(
        { code: '42P01', message: 'relation "public.subscriptions" does not exist' },
        404
      )
    );

    const check = await probeSupabaseStore(config, { fetchImpl: impl });

    assert.equal(check.reachable, false);
    assert.match(String(check.error), /does not exist/);
  });

  it('reports a rejected service key as unreachable', async () => {
    const { impl } = createFetch(() => jsonResponse({ message: 'Invalid API key' }, 401));

    const check = await probeSupabaseStore(config, { fetchImpl: impl });

    assert.equal(check.reachable, false);
    assert.match(String(check.error), /Invalid API key/);
  });

  it('reports a store that never answers as unreachable, rather than waiting forever', async () => {
    // supabase-js retries a transport failure, so a fire-and-forget rejection is not what an
    // outage looks like from here — a request that never settles is. The timeout is injected
    // so this does not cost the suite five seconds.
    const { impl } = createFetch(() => new Promise<Response>(() => {}));

    const check = await probeSupabaseStore(config, { fetchImpl: impl, timeoutMs: 25 });

    assert.equal(check.reachable, false);
    assert.match(String(check.error), /timed out/);
  });

  it('probes a table the migrations create, with the key the runtime writes with', async () => {
    const { impl, calls } = createFetch(() => jsonResponse([], 200));

    await probeSupabaseStore(config, { fetchImpl: impl });

    assert.equal(calls.length, 1, `expected one probe, saw ${JSON.stringify(calls)}`);
    const [call] = calls;
    const pathname = new URL(call.url).pathname;
    assert.ok(
      pathname.includes('subscription_status'),
      `the probe must read subscription_status, saw ${call.url}`
    );
    assert.ok(
      !pathname.split('/').includes('subscriptions'),
      'the probe must not read a table no migration creates'
    );
    const credentials = `${call.headers.apikey ?? ''} ${call.headers.authorization ?? ''}`;
    assert.ok(
      credentials.includes(SERVICE_ROLE_KEY),
      `the probe must authenticate as the runtime, saw ${JSON.stringify(call.headers)}`
    );
    assert.ok(
      !credentials.includes(ANON_KEY),
      'the probe must not use the anon browser key, which RLS refuses on this table'
    );
  });

  it('reports a rate-limit store that answers a bad status as unreachable', async () => {
    const withUpstash = {
      ...config,
      rateLimit: {
        storeMode: 'upstash',
        upstashUrl: 'https://cache.example.com',
        upstashToken: 't',
      },
    } as unknown as StoreConfigView;
    const { impl } = createFetch(() => jsonResponse({}, 401));

    const check = await probeRateLimitStore(withUpstash, { fetchImpl: impl });

    assert.equal(check.reachable, false);
    assert.match(String(check.error), /HTTP 401/);
  });
});

describe('both endpoints report the same stores', () => {
  it('names the store cheaply, so liveness never pays for a round trip', async () => {
    const identity = supabaseStoreCheck(config);

    assert.deepEqual(identity, {
      configured: true,
      projectRef: PROJECT_REF,
      reachable: null,
    });
    // A liveness-shaped check can never degrade a report: only a probe ran and failed counts.
    assert.equal(
      hasStoreOutage({ supabase: identity, rateLimit: { configured: true, reachable: null } }),
      false
    );
  });

  it('describes the same store when it probes, and only reachable differs', async () => {
    const { impl } = createFetch(() => jsonResponse([], 200));

    const probed = await collectStoreChecks(config, { probe: true, fetchImpl: impl });
    const identity = await collectStoreChecks(config, { probe: false });

    assert.equal(probed.supabase.configured, identity.supabase.configured);
    assert.equal(probed.supabase.projectRef, identity.supabase.projectRef);
    assert.equal(identity.supabase.reachable, null);
    assert.equal(probed.supabase.reachable, true);
  });

  it('does no I/O at all when it is not probing', async () => {
    const { impl, calls } = createFetch(() => jsonResponse([], 200));

    const checks = await collectStoreChecks(config, { probe: false, fetchImpl: impl });

    assert.deepEqual(calls, []);
    assert.equal(hasStoreOutage(checks), false);
  });

  it('serves the same store identity from /api/health and /api/diagnostics', async () => {
    const config = createBackendConfig({
      NODE_ENV: 'test',
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY,
      APP_VERSION: '4.0.1',
    });
    const { impl, calls } = createFetch(() => jsonResponse([], 200));
    const app = createApp({ config, fetchImpl: impl });
    const server = app.listen(0);
    servers.push(server);
    await new Promise((resolve) => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;

    const storeProbes = () => calls.filter((call) => call.url.includes('subscription_status'));

    const liveness = await (await fetch(`${base}/api/health`)).json();
    const probesDuringLiveness = storeProbes().length;
    const diagnosticsResponse = await fetch(`${base}/api/diagnostics`);
    const diagnostics = await diagnosticsResponse.json();

    assert.deepEqual(
      { configured: liveness.checks.supabase.configured, ref: liveness.checks.supabase.projectRef },
      {
        configured: diagnostics.checks.supabase.configured,
        ref: diagnostics.checks.supabase.projectRef,
      }
    );
    assert.equal(liveness.checks.supabase.projectRef, PROJECT_REF);
    // The liveness payload names the check as unprobed rather than leaving a gap a caller
    // would have to interpret, and it did not perform one to say so.
    assert.equal(liveness.checks.supabase.reachable, null);
    // Counting only the store probe: the app's own background init shares this fetch, so a
    // bare call count would be measuring that instead of the liveness path.
    assert.equal(probesDuringLiveness, 0, 'liveness must not probe the store');
    assert.equal(storeProbes().length, 1, 'diagnostics must probe it exactly once');
    assert.equal(diagnostics.checks.supabase.reachable, true);
  });

  it('shows a store outage in /api/diagnostics while both still name the same store', async () => {
    const config = createBackendConfig({
      NODE_ENV: 'test',
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY,
      APP_VERSION: '4.0.1',
    });
    // Every PostgREST call fails the way the outage did, including the audit store's, so the
    // report is degraded for reasons the probe had to discover rather than assume.
    const { impl } = createFetch(() =>
      jsonResponse({ code: '42P01', message: 'relation "public.x" does not exist' }, 404)
    );
    const app = createApp({ config, fetchImpl: impl });
    const server = app.listen(0);
    servers.push(server);
    await new Promise((resolve) => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;

    const liveness = await (await fetch(`${base}/api/health`)).json();
    const diagnosticsResponse = await fetch(`${base}/api/diagnostics`);
    const diagnostics = await diagnosticsResponse.json();

    assert.equal(diagnostics.checks.supabase.reachable, false);
    assert.match(String(diagnostics.checks.supabase.error), /does not exist/);
    assert.equal(diagnosticsResponse.status, 503);
    // The store it names is still the store this process is configured for — an outage is not
    // a different database, and a reader comparing the two payloads must be able to see that.
    assert.equal(diagnostics.checks.supabase.projectRef, liveness.checks.supabase.projectRef);
    assert.equal(toPublicHealth(config).checks.supabase.projectRef, PROJECT_REF);
  });
});

const servers: Array<{ close: () => void }> = [];

afterEach(() => {
  servers.splice(0).forEach((server) => server.close());
});
