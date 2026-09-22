import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { checkSupabaseHealth } from '../src/app.js';
import type { BackendConfig } from '../types.js';

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
 */

const SERVICE_ROLE_KEY = 'test-service-role-key';
const ANON_KEY = 'test-anon-key';
const SUPABASE_URL = 'https://abcdefghijklmnopqrst.supabase.co';

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
} as unknown as BackendConfig;

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

const probe = async (
  fetchImpl: typeof fetch,
  timeoutMs?: number
): Promise<{
  supabase: Record<string, unknown>;
  health: { status: string; ok: boolean };
}> => {
  const checks: Record<string, unknown> = {};
  const health = { status: 'ok', ok: true };
  await checkSupabaseHealth(config, checks, health, fetchImpl, timeoutMs);
  return { supabase: checks.supabase as Record<string, unknown>, health };
};

describe('diagnostics Supabase probe', () => {
  it('reports a store that answers as reachable', async () => {
    const { impl } = createFetch(() => jsonResponse([], 200));

    const { supabase, health } = await probe(impl);

    assert.equal(supabase.reachable, true);
    assert.equal(supabase.projectRef, 'abcdefghijklmnopqrst');
    assert.equal(health.status, 'ok');
    assert.equal(health.ok, true);
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

    const { supabase, health } = await probe(impl);

    assert.equal(supabase.reachable, false);
    assert.equal(health.status, 'degraded');
    assert.equal(health.ok, false);
    assert.match(String(supabase.error), /does not exist/);
  });

  it('reports a rejected service key as unreachable', async () => {
    const { impl } = createFetch(() => jsonResponse({ message: 'Invalid API key' }, 401));

    const { supabase, health } = await probe(impl);

    assert.equal(supabase.reachable, false);
    assert.equal(health.ok, false);
    assert.match(String(supabase.error), /Invalid API key/);
  });

  it('reports a store that never answers as unreachable, rather than waiting forever', async () => {
    // supabase-js retries a transport failure, so a fire-and-forget rejection is not what an
    // outage looks like from here — a request that never settles is. The timeout is injected
    // so this does not cost the suite five seconds.
    const { impl } = createFetch(() => new Promise<Response>(() => {}));

    const { supabase, health } = await probe(impl, 25);

    assert.equal(supabase.reachable, false);
    assert.equal(health.ok, false);
    assert.match(String(supabase.error), /timed out/);
  });

  it('probes a table the migrations create, with the key the runtime writes with', async () => {
    const { impl, calls } = createFetch(() => jsonResponse([], 200));

    await probe(impl);

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
});
