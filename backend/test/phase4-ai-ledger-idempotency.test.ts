import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import { createMemoryAiLedger } from '../src/ai-ledger.js';

describe('Phase 4 AI ledger idempotency', () => {
  it('deduplicates one user and request ID while preserving user isolation', async () => {
    const ledger = createMemoryAiLedger();
    const session = {
      operation: 'translate',
      requestId: 'request-id-0001',
      tokensUsed: 50,
    };

    await ledger.logSession('user-a', session);
    await ledger.logSession('user-a', session);
    await ledger.logSession('user-b', session);

    assert.equal((await ledger.getUserAnalytics('user-a')).totalRequests, 1);
    assert.equal((await ledger.getUserAnalytics('user-b')).totalRequests, 1);
  });

  it('passes the resolved request ID as a first-class ledger field', async () => {
    const source = await readFile(new URL('../src/ai.ts', import.meta.url), 'utf8');
    assert.match(
      source,
      /ledger\.logSession\(userId,\s*\{\s*requestId,/,
      'AI routes must not store the request ID only inside metadata.'
    );
  });

  it('keeps the database uniqueness contract for non-null request IDs', async () => {
    const migration = await readFile(
      new URL('../../supabase/migrations/202609070003_atomic_ai_billing.sql', import.meta.url),
      'utf8'
    );
    assert.match(migration, /add column if not exists request_id text/);
    assert.match(migration, /on public\.ai_sessions \(user_id, request_id\)/);
    assert.match(migration, /where request_id is not null/);
  });
});
