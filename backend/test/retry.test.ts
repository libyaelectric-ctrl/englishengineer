import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isRetryableProviderError, stripeRetry } from '../src/utils/retry.js';

const errorWith = (fields: Record<string, unknown>): Error =>
  Object.assign(new Error('provider error'), fields);

describe('provider retry classification', () => {
  it('retries the status a Stripe SDK error carries in statusCode', () => {
    assert.equal(
      isRetryableProviderError(errorWith({ statusCode: 429, code: 'rate_limit_error' })),
      true
    );
    assert.equal(isRetryableProviderError(errorWith({ statusCode: 503, type: 'api_error' })), true);
  });

  it('still recognises the status field this backend uses', () => {
    assert.equal(isRetryableProviderError(errorWith({ status: 503 })), true);
  });

  it('does not retry a deterministic failure', () => {
    assert.equal(
      isRetryableProviderError(errorWith({ statusCode: 402, code: 'card_declined' })),
      false
    );
    assert.equal(isRetryableProviderError(errorWith({ statusCode: 400 })), false);
  });

  it('never reads a provider code as an HTTP status', () => {
    assert.equal(isRetryableProviderError(errorWith({ code: '503' })), false);
    assert.equal(isRetryableProviderError(errorWith({ code: '500' })), false);
  });

  it('has no status to judge when the error carries none', () => {
    assert.equal(isRetryableProviderError(new Error('socket hang up')), false);
  });
});

describe('stripeRetry', () => {
  it('retries a Stripe shaped 503 that succeeds on the next attempt', async () => {
    let attempts = 0;
    const result = await stripeRetry(async () => {
      attempts += 1;
      if (attempts === 1) throw errorWith({ statusCode: 503, type: 'api_error' });
      return 'ok';
    });

    assert.equal(result, 'ok');
    assert.equal(attempts, 2, 'a real Stripe failure must be retried');
  });

  it('fails fast on a declined card', async () => {
    let attempts = 0;
    await assert.rejects(() =>
      stripeRetry(async () => {
        attempts += 1;
        throw errorWith({ statusCode: 402, code: 'card_declined' });
      })
    );

    assert.equal(attempts, 1);
  });
});
