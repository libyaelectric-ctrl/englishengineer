import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  AUDIT_ACTIONS,
  type AuditRemoteError,
  auditLog,
  getAuditLogStatus,
  initAuditLog,
} from '../src/audit-log.js';
import { ApiError } from '../src/errors.js';
import winstonLogger from '../src/logger.js';
import { createSupabaseAuditLogRepository } from '../src/supabase-audit-log-repository.js';
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

const lostAcknowledgement = { status: 503, body: '{"message":"connection reset"}' };

/**
 * What PostgREST answers when a write collides with a row that is already there.
 *
 * The constraint names and `details` strings below are the ones Postgres 16 and
 * PostgREST 12 actually produced for this table, captured from a real stack —
 * including the expression key of a secondary unique index, which is neither a
 * bare column name nor named the way a hand-written body would name it.
 * `scripts/verify-audit-collision-attribution.mjs` re-derives them on every run.
 */
const uniqueViolation = (constraint: string, details: string | null): string =>
  JSON.stringify({
    code: '23505',
    message: `duplicate key value violates unique constraint "${constraint}"`,
    details,
    hint: null,
  });

/** Measured: a write whose `user_id` does not exist. Not a unique violation. */
const foreignKeyViolation = JSON.stringify({
  code: '23503',
  details: 'Key (user_id)=(00000000-0000-0000-0000-0000000000ff) is not present in table "users".',
  hint: null,
  message:
    'insert or update on table "audit_logs" violates foreign key constraint "audit_logs_user_id_fkey"',
});

/** How the retry's collision is attributed, if at all. */
type Collision = 'own-key' | 'other-key' | 'no-details';

const readRecordId = (body: unknown): string => {
  try {
    return String((JSON.parse(String(body ?? '{}')) as { id?: string }).id);
  } catch {
    return 'unparsed';
  }
};

const isAuditUnavailable = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 503 && error.code === 'audit_log_unavailable';

/**
 * A Supabase stand-in: records the methods it was asked for, can be taken down
 * (unreachable for a probe and for a write alike, which is what a real outage
 * looks like), can fail a scripted number of *write attempts* (a retry counts as
 * its own attempt, which is what makes the retry observable), and can hold a
 * health check open.
 *
 * A down store answers 401 to a probe — a rejected service key, i.e. the probe
 * fails immediately. It deliberately does not answer 503 there: supabase-js
 * retries a 503 four times with backoff, so a 503 health check costs seven
 * seconds and would dominate this suite without testing anything extra.
 */
const createSupabaseStub = () => {
  const calls: string[] = [];
  /** The record id of every write the store was asked to deliver. */
  const deliveredIds: string[] = [];
  /** Scripted write responses, consumed in order; the last one repeats. */
  const scriptedWrites: Array<{ status: number; body: string }> = [];
  let down = false;
  let writes = 0;
  let writeFailures = 0;
  let healthDelayMs = 0;
  /** When set, the retry collides with a row that is already there. */
  let collision: Collision | null = null;

  const impl = (async (_input: string | URL | Request, init?: RequestInit) => {
    const method = (init?.method ?? 'GET').toUpperCase();
    calls.push(method);
    if (method !== 'POST') {
      if (healthDelayMs > 0) await new Promise((resolve) => setTimeout(resolve, healthDelayMs));
      return down ? json('{"message":"invalid api key"}', 401) : json('[]', 200);
    }
    writes += 1;
    deliveredIds.push(readRecordId(init?.body));
    if (collision) {
      // The first delivery is persisted and its acknowledgement is lost, so the
      // retry meets a row that is already there.
      if (deliveredIds.length === 1)
        return json(lostAcknowledgement.body, lostAcknowledgement.status);
      const storedId = deliveredIds[0] ?? 'audit_unknown';
      const [constraint, details] =
        collision === 'own-key'
          ? ['audit_logs_pkey', `Key (id)=(${storedId}) already exists.`]
          : collision === 'other-key'
            ? [
                'audit_logs_correlation_key',
                "Key ((details ->> 'correlationKey'::text))=(req_shared) already exists.",
              ]
            : ['audit_logs_pkey', null];
      return json(uniqueViolation(constraint, details), 409);
    }
    const scripted = scriptedWrites.length > 1 ? scriptedWrites.shift() : scriptedWrites[0];
    if (scripted) return json(scripted.body, scripted.status);
    return down || writes <= writeFailures
      ? json('{"message":"connection reset"}', 503)
      : json('[]', 201);
  }) as typeof fetch;

  return {
    impl,
    calls,
    deliveredIds,
    scriptWrites: (responses: Array<{ status: number; body: string }>) => {
      scriptedWrites.length = 0;
      scriptedWrites.push(...responses);
    },
    collideOnRetry: (kind: Collision) => {
      collision = kind;
    },
    setDown: (value: boolean) => {
      down = value;
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

  it('recovers on the very next request once the store answers again', async () => {
    const stub = createSupabaseStub();
    stub.setDown(true);
    await assert.rejects(() => startAudit(stub));
    stub.calls.length = 0;

    // The store is still down, so the action fails closed.
    await assert.rejects(
      () => auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-window' }),
      isAuditUnavailable
    );
    assert.equal(getAuditLogStatus().status, 'failed');

    // The store answers again. The next request is not made to wait out a
    // cooldown, and its own write — not a health check — is the proof.
    stub.setDown(false);
    stub.calls.length = 0;
    await auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-window' });

    assert.equal(getAuditLogStatus().status, 'ready');
    assert.deepEqual(stub.calls, ['POST'], 'the write itself verified the store');
  });

  it('shares one check between callers that arrive while an attempt is in flight', async () => {
    const stub = createSupabaseStub();
    // Hold the attempt open so both callers are inside it at the same time.
    stub.slowHealthCheckBy(40);
    stub.calls.length = 0;

    await Promise.all([startAudit(stub), startAudit(stub)]);

    assert.equal(methodCount(stub.calls, 'GET'), 1, 'one shared check');
    assert.equal(getAuditLogStatus().status, 'ready');
  });

  it('logs the failure it recovered from', async () => {
    const stub = createSupabaseStub();
    stub.setDown(true);
    await assert.rejects(() => startAudit(stub));
    stub.setDown(false);

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

  it('fails closed and spends no health check while the store is unreachable', async () => {
    const stub = createSupabaseStub();
    stub.setDown(true);
    await assert.rejects(() => startAudit(stub));
    assert.equal(getAuditLogStatus().status, 'failed');
    stub.calls.length = 0;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await assert.rejects(
        () => auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-nostore' }),
        isAuditUnavailable
      );
    }

    assert.equal(getAuditLogStatus().status, 'failed');
    assert.equal(methodCount(stub.calls, 'GET'), 0, 'no health check while the store is down');
    assert.equal(methodCount(stub.calls, 'POST'), 6, 'one bounded write attempt per action');
  });

  it('treats a retry that collides with its own record as that record having landed', async () => {
    const stub = createSupabaseStub();
    await startAudit(stub);
    stub.calls.length = 0;
    stub.collideOnRetry('own-key');

    const records = await captureLogs(() =>
      auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-landed' })
    );

    assert.equal(getAuditLogStatus().status, 'ready');
    assert.equal(methodCount(stub.calls, 'POST'), 2, 'the write was retried once');
    assert.equal(
      new Set(stub.deliveredIds).size,
      1,
      'the same record was delivered twice, not two records'
    );
    assert.ok(
      records.some(
        (record) => record.message === 'Audit record was already stored when its retry arrived'
      ),
      `expected a lost-acknowledgement record, saw ${JSON.stringify(
        records.map((record) => record.message)
      )}`
    );
  });

  it('refuses when the retry fails for a reason other than its own record', async () => {
    const stub = createSupabaseStub();
    await startAudit(stub);
    stub.calls.length = 0;
    // A conflict that is not a unique violation must not be read as a landed
    // write: the failure stays fail-closed.
    stub.scriptWrites([{ status: 409, body: foreignKeyViolation }]);

    await assert.rejects(
      () => auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-not-landed' }),
      isAuditUnavailable
    );
    assert.equal(getAuditLogStatus().status, 'failed');
    assert.equal(methodCount(stub.calls, 'POST'), 2);
  });

  it('refuses when the retry collides with a key other than its own record', async () => {
    const stub = createSupabaseStub();
    await startAudit(stub);
    stub.calls.length = 0;
    // A unique violation on some other key says nothing about this record, so the
    // action must not be told its audit record is stored. This is the measured
    // shape of a secondary unique index over an expression: a key the attribution
    // cannot resolve to a record identity at all (the bare-column case, where the
    // key resolves but names somebody else, is pinned directly below).
    stub.collideOnRetry('other-key');

    await assert.rejects(
      () => auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-other-key' }),
      isAuditUnavailable
    );
    assert.equal(getAuditLogStatus().status, 'failed');
    assert.equal(methodCount(stub.calls, 'POST'), 2);
  });

  it('refuses when a collision names no key it can attribute', async () => {
    const stub = createSupabaseStub();
    await startAudit(stub);
    stub.calls.length = 0;
    // A duplicate with nothing to attribute it to is not proof that *this* record
    // landed, so it stays a failure.
    stub.collideOnRetry('no-details');

    await assert.rejects(
      () => auditLog({ action: AUDIT_ACTIONS.CHECKOUT_CREATED, userId: 'user-unattributed' }),
      isAuditUnavailable
    );
    assert.equal(getAuditLogStatus().status, 'failed');
  });

  it('carries the remote code and attributes only its own record as a collision', async () => {
    const ownId = 'audit_own_record';
    const respondWith = (body: string) =>
      (async () =>
        new Response(body, {
          status: 409,
          headers: { 'content-type': 'application/json' },
        })) as typeof fetch;
    const insertThrough = async (body: string) => {
      const repository = createSupabaseAuditLogRepository(
        {
          supabaseUrl: SUPABASE_STUB.supabaseUrl,
          supabaseServiceRoleKey: SUPABASE_STUB.supabaseServiceRoleKey,
        },
        respondWith(body)
      );
      try {
        await repository?.insert({ id: ownId, timestamp: new Date().toISOString() });
        return {};
      } catch (error) {
        const remote = error as AuditRemoteError;
        return { code: remote.code, duplicates: remote.duplicatesRequestedRecord };
      }
    };

    const ownKey = await insertThrough(
      uniqueViolation('audit_logs_pkey', `Key (id)=(${ownId}) already exists.`)
    );
    const otherKey = await insertThrough(
      uniqueViolation('audit_logs_user_id_key', 'Key (user_id)=(someone-else) already exists.')
    );
    const unattributed = await insertThrough(uniqueViolation('audit_logs_pkey', null));

    assert.equal(ownKey.code, '23505');
    assert.equal(ownKey.duplicates, true);
    assert.equal(otherKey.code, '23505', 'the code is carried whatever the key names');
    assert.equal(otherKey.duplicates, undefined, 'another key is not this record');
    assert.equal(unattributed.duplicates, undefined, 'nothing to attribute');
  });
});
