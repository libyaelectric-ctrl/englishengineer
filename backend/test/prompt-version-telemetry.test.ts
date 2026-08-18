import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getPromptVersionTelemetry,
  recordPromptVersionUsage,
  resetPromptVersionTelemetry,
} from '../src/ai-core/prompt-version-telemetry.js';
import { getBundledPromptVersion } from '../src/prompts/prompt-loader.js';

describe('Prompt version telemetry', () => {
  it('bundled manifest exposes a version for tracked prompt keys', () => {
    assert.ok(getBundledPromptVersion('json-structure'));
    assert.ok(getBundledPromptVersion('content-generation'));
    assert.equal(getBundledPromptVersion('does-not-exist'), null);
  });

  it('recording a file-served call does not flag a mismatch', () => {
    resetPromptVersionTelemetry();
    recordPromptVersionUsage('json-structure', '1.0.0', 'file', '1.0.0');

    const usage = getPromptVersionTelemetry()[0];
    assert.equal(usage.key, 'json-structure');
    assert.equal(usage.servedSource, 'file');
    assert.equal(usage.servedCount, 1);
    assert.equal(usage.mismatchCount, 0);
  });

  it('recording a db-served call flags a drift mismatch', () => {
    resetPromptVersionTelemetry();
    recordPromptVersionUsage('json-structure', '1.0.0', 'db', '1.0.0');

    const usage = getPromptVersionTelemetry()[0];
    assert.equal(usage.databaseServerCount, 1);
    assert.equal(usage.mismatchCount, 1);
  });

  it('recording a different served version flags a version mismatch', () => {
    resetPromptVersionTelemetry();
    recordPromptVersionUsage('content-generation', '0.9.0', 'file', '1.0.0');

    const usage = getPromptVersionTelemetry()[0];
    assert.equal(usage.servedVersion, '0.9.0');
    assert.equal(usage.bundledVersion, '1.0.0');
    assert.equal(usage.mismatchCount, 1);
  });

  it('accumulates counts across calls and resets', () => {
    resetPromptVersionTelemetry();
    recordPromptVersionUsage('json-structure', '1.0.0', 'file', '1.0.0');
    recordPromptVersionUsage('json-structure', '1.0.0', 'file', '1.0.0');
    assert.equal(getPromptVersionTelemetry()[0].servedCount, 2);

    resetPromptVersionTelemetry();
    assert.equal(getPromptVersionTelemetry().length, 0);
  });
});
