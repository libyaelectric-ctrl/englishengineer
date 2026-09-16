import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setAuthTokenGetter } from '@/shared/services/auth-backend/backend-auth.service';
import { SESSION_NAMESPACE_EVENT } from '@/shared/storage';

import { useBillingStore } from '@/features/billing/billing.store';

import { SessionDataBridge } from '../SessionDataBridge';

/**
 * Lives beside its own feature: the reset below is a writer of the billing panel's
 * failure pair, so it is exercised here rather than from the billing feature, which
 * would add a counted feature-to-feature import for a test.
 *
 * A session reset that cleared only the message left the previous failure's code
 * behind it, and the panel picks its copy from the code.
 */

const AUDIT_FAILURE = {
  ok: false,
  error: { code: 'audit_log_unavailable', message: 'Required audit logging is unavailable.' },
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(AUDIT_FAILURE), {
          status: 503,
          headers: { 'content-type': 'application/json' },
        })
    )
  );
  setAuthTokenGetter(async () => 'test-id-token');
  useBillingStore.getState().setBillingError(null);
});

afterEach(() => {
  setAuthTokenGetter(null);
});

describe('SessionDataBridge billing reset', () => {
  it('drops the failure and its code together when the session is cleared', async () => {
    // Seed a failure that arrived with a code, the way a failed checkout does.
    await expect(
      useBillingStore.getState().startCheckout('user-1', 'engineer@example.com', 'senior')
    ).rejects.toThrow(/audit logging is unavailable/i);
    expect(useBillingStore.getState().errorCode).toBe('audit_log_unavailable');

    render(<SessionDataBridge />);
    act(() => {
      window.dispatchEvent(
        new CustomEvent(SESSION_NAMESPACE_EVENT, { detail: { phase: 'cleared' } })
      );
    });

    expect(useBillingStore.getState().error).toBeNull();
    expect(useBillingStore.getState().errorCode).toBeNull();
  });
});
