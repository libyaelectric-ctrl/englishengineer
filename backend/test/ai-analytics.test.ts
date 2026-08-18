import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMemoryAiLedger } from '../src/ai-ledger.js';
import { getResolvedPromptVersion } from '../src/prompts/prompt-loader.js';

describe('AI Analytics & Prompt Versioning', () => {
  it('getResolvedPromptVersion returns the bundled manifest version with file source by default', () => {
    const resolved = getResolvedPromptVersion('json-structure');
    assert.ok(resolved, 'json-structure should be present in the version manifest');
    assert.equal(typeof resolved.version, 'string');
    assert.ok(resolved.version.length > 0);
    assert.equal(resolved.source, 'file');
  });

  it('getResolvedPromptVersion returns null for an unknown key', () => {
    assert.equal(getResolvedPromptVersion('does-not-exist'), null);
  });

  it('memory ledger aggregates per-user analytics', async () => {
    const ledger = createMemoryAiLedger();
    await ledger.logSession('user-a', {
      operation: 'analyzeProgress',
      durationMs: 1000,
      tokensUsed: 1200,
    });
    await ledger.logSession('user-a', {
      operation: 'analyzeProgress',
      durationMs: 2000,
      tokensUsed: 800,
    });
    await ledger.logSession('user-a', {
      operation: 'translate',
      durationMs: 500,
      tokensUsed: 400,
    });
    // Other user must be excluded.
    await ledger.logSession('user-b', {
      operation: 'analyzeProgress',
      durationMs: 9999,
      tokensUsed: 9999,
    });

    const analytics = await ledger.getUserAnalytics('user-a');
    assert.equal(analytics.totalRequests, 3);
    assert.equal(analytics.averageDurationMs, Math.round((1000 + 2000 + 500) / 3));
    assert.equal(analytics.totalEstimatedTokens, 1200 + 800 + 400);
    assert.ok(analytics.estimatedCostUsd > 0);
    assert.deepEqual(
      analytics.byOperation.find((o) => o.operation === 'analyzeProgress'),
      { operation: 'analyzeProgress', count: 2 }
    );
    assert.equal(
      analytics.byDay.find((d) => d.date === new Date().toISOString().split('T')[0])?.count,
      3
    );
  });

  it('memory ledger returns empty analytics when no sessions exist', async () => {
    const ledger = createMemoryAiLedger();
    const analytics = await ledger.getUserAnalytics('nobody');
    assert.equal(analytics.totalRequests, 0);
    assert.equal(analytics.totalEstimatedTokens, 0);
    assert.equal(analytics.byOperation.length, 0);
  });
});
