import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMetricsRepository } from '../src/supabase-metrics-repository.js';

// Port 9 (discard) on loopback: if the injected fetch is ignored, the client
// falls back to global fetch and fails fast instead of reaching the network.
const SUPABASE_CONFIG = {
  repositoryMode: 'supabase',
  supabaseUrl: 'http://127.0.0.1:9',
  supabaseServiceRoleKey: 'test-service-role-key',
};

describe('createMetricsRepository', () => {
  it('sends Supabase flushes through the injected fetch', async () => {
    const requestedUrls: string[] = [];
    const injectedFetch = (async (input: string | URL | Request) => {
      requestedUrls.push(String(input));
      return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    const repository = createMetricsRepository(SUPABASE_CONFIG, injectedFetch);
    try {
      repository.recordRequest(12, false, 'GET', '/api/v1/health');
      const flushed = await repository.flush();

      assert.equal(
        requestedUrls.some((url) => url.includes('performance_request_metrics')),
        true,
        'the metrics flush must go through the injected fetch'
      );
      assert.deepEqual(flushed, { endpoints: 0, requests: 1, rateLimits: 0 });
    } finally {
      repository.destroy();
    }
  });
});
