import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AUDIT_ACTIONS, auditLog, getAuditLogStatus, initAuditLog } from '../src/audit-log.js';
import { ApiError } from '../src/errors.js';
import winstonLogger from '../src/logger.js';
import type { WorkspaceConfig } from '../types.js';

// Port 9 (discard) on loopback: if the injected fetch were ignored the client
// would fall back to global fetch and fail fast instead of reaching the
// network, so every assertion below is hermetic.
const SUPABASE_STUB: WorkspaceConfig = {
  configured: true,
  supabaseUrl: 'http://127.0.0.1:9',
  supabaseServiceRoleKey: 'test-service-role-key',
};

const json = (body: string, status: number): Response =>
  new Response(body, {
    status,
    headers: { 'content-type': 'application/json', 'content-range': '0-0/0' },
  });

const isAuditUnavailable = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 503 && error.code === 'audit_log_unavailable';

/**
 * A Supabase stand-in: records the methods it was asked for, can be taken
 * offline, and can fail a scripted number of *write attempts* (a retry counts
 * as its own attempt, which is what makes the retry observable).
 *
 * An offline store answers 401 — a rejected service key, i.e. the probe fails
 * immediately. It deliberately does not answer 503: supabase-js retries a 503
 * four times with backoff, so a 503 health check costs seven seconds and would
 * dominate this suite without testing anything extra.
 */
const createSupabaseStub = () => {
  const calls: string[] = [];
  let writes = 0;
  let healthOk = true;
  let writeFailures = 0;
  let healthDelayMs = 0;

  const impl = (async (_input: string | URL | Request, init?: RequestInit) => {
    const method = (init?.method ?? 'GET').toUpperCase();
    calls.push(method);
    if (method !== 'POST') {
      if (healthDelayMs > 0) await new Promise((resolve) => setTimeout(resolve, healthDelayMs));
      return healthOk ? json('[]', 200) : json('{"message":"invalid api key"}', 401);
    }
    writes += 1;
    return writes <= writeFailures ? json('{"message":"connection reset"}', 503) : json('[]', 201);
  }) as typeof fetch;

  return {
    impl,
    calls,
    writes: () => writes,
    setHealthy: (value: boolean) => {
      healthOk = value;
    },
    failFirstWrites: (count: number) => {
      writeFailures = count;
    },
    slowHealthCheckBy: (ms: number) => {
      healthDelayMs = ms;
    },
  };
};

type Stub = ReturnType<typeof createSupabaseStub>;

const methodCount = (calls: string[], method: string): number =>
  calls.filter((call) => call === method).length;

const startAudit = (stub: Stub): Promise<void> =>
  initAuditLog({ environment: 'production', workspace: { ...SUPABASE_STUB } }, stub.impl);

/**
 * Collects the records the logger emits while `run` executes.
 *
 * Subscribing to the logger rather than patching `process.stdout` is what keeps
 * this suite honest: the test reporter writes its results to stdout, so
 * intercepting that stream swallows the result of the test before this one and
 * turns it into a test that silently cannot fail.
 */
const captureLogs = async (
  run: () => Promise<unknown>
): Promise<Array<Record<string, unknown>>> => {
  const records: Array<Record<string, unknown>> = [];
  const listener = (info: Record<string, unknown>): void => {
    records.push(info);
  };
  winstonLogger.on('data', listener);
  try {
    await run();
  } finally {
    winstonLogger.off('data', listener);
  }
  return records;
};

describe('audit log recovery', () => {
  it('absorbs one transient write blip without failing the audited action', async () => {
    const stub = createSupabaseStub();
    stub.failFirstWrites(1);
    await startAudit(stub);
    stub.calls.length = 0;

    await auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-blip' });

    assert.equal(getAuditLogStatus().status, 'ready');
    assert.deepEqual(stub.calls, ['POST', 'POST'], 'the write was retried, not the client rebuilt');
  });

  it('keeps the existing client after a write failure instead of rebuilding it', async () => {
    const stub = createSupabaseStub();
    // Both attempts of the first write fail, so the action really does fail.
    stub.failFirstWrites(2);
    await startAudit(stub);
    stub.calls.length = 0;

    await assert.rejects(
      () => auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-kept' }),
      isAuditUnavailable
    );
    assert.equal(getAuditLogStatus().status, 'failed');
    assert.deepEqual(stub.calls, ['POST', 'POST']);

    // The next audited action recovers by writing again: the client is still
    // good, so no health check and no new client are spent on the way.
    stub.calls.length = 0;
    await auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-kept' });

    assert.deepEqual(stub.calls, ['POST']);
    assert.equal(getAuditLogStatus().status, 'ready');
  });

  it('shares one rebuild between callers that arrive while it is in flight', async () => {
    const stub = createSupabaseStub();
    stub.setHealthy(false);
    await assert.rejects(() => startAudit(stub));
    assert.equal(getAuditLogStatus().status, 'failed');

    stub.setHealthy(true);
    // Hold the rebuild open so both callers are in it at the same time.
    stub.slowHealthCheckBy(40);
    stub.calls.length = 0;

    const results = await Promise.allSettled([
      auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-a' }),
      auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-b' }),
    ]);

    assert.deepEqual(
      results.map((result) => result.status),
      ['fulfilled', 'fulfilled'],
      'a caller arriving during recovery is not rejected'
    );
    assert.equal(methodCount(stub.calls, 'GET'), 1, 'one shared rebuild');
    assert.equal(methodCount(stub.calls, 'POST'), 2, 'both callers reached the store');
  });

  it('logs the failure it recovered from', async () => {
    const stub = createSupabaseStub();
    stub.setHealthy(false);
    await assert.rejects(() => startAudit(stub));
    stub.setHealthy(true);

    const records = await captureLogs(() =>
      auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-log' })
    );

    const recovery = records.find(
      (record) => record.message === 'Audit logging recovered after a failure'
    );
    assert.ok(
      recovery,
      `expected a recovery record, saw ${JSON.stringify(records.map((record) => record.message))}`
    );
    assert.match(String(recovery.previousError), /invalid api key/);
  });

  it('stays fail-closed throughout a sustained write outage', async () => {
    const stub = createSupabaseStub();
    stub.failFirstWrites(Number.POSITIVE_INFINITY);
    await startAudit(stub);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await assert.rejects(
        () => auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-down' }),
        isAuditUnavailable
      );
    }

    assert.equal(getAuditLogStatus().status, 'failed');
    assert.equal(methodCount(stub.calls, 'GET'), 1, 'no rebuild: the client was never lost');
    assert.equal(methodCount(stub.calls, 'POST'), 6, 'two attempts per audited action');
  });

  // Keep this one last: a failed rebuild arms the recovery cooldown, which
  // would suppress the rebuild that the tests above need to observe.
  it('fails closed when the store is unreachable at initialization', async () => {
    const stub = createSupabaseStub();
    stub.setHealthy(false);
    await assert.rejects(() => startAudit(stub));
    assert.equal(getAuditLogStatus().status, 'failed');

    await assert.rejects(
      () => auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-nostore' }),
      isAuditUnavailable
    );

    assert.ok(methodCount(stub.calls, 'GET') >= 1, 'the rebuild was attempted');
  });
});
