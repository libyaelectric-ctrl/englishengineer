import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setAuthTokenGetter } from '@/shared/services/auth-backend/backend-auth.service';

import { BillingStatusPanel } from './BillingStatusPanel';
import { useBillingStore } from './billing.store';

/**
 * The propagation nothing else pins: store, service and provider are the real ones
 * and only the transport is stubbed. The panel tests hand the panel a code directly
 * and the provider tests stop at the provider, so a customer clicking Upgrade is the
 * only thing that spans all three — and that seam is what decides which sentence is
 * shown for a failure.
 */

const AUDIT_FAILURE = {
  ok: false,
  error: { code: 'audit_log_unavailable', message: 'Required audit logging is unavailable.' },
};

const AUDIT_COPY = 'Billing could not be started because the service is temporarily unavailable';
const UNREACHABLE =
  'Billing service is currently unreachable. Please check your connection or try again later.';

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

let fetchMock: ReturnType<typeof vi.fn>;

/** Renders the panel the way BillingPage does: straight from the store's state. */
const renderPanelFromStore = (): HTMLElement => {
  const { subscription, providerStatus, error, errorCode } = useBillingStore.getState();
  render(
    <BillingStatusPanel
      subscription={subscription}
      providerStatus={providerStatus}
      isLoading={false}
      onUpgrade={vi.fn()}
      onOpenPortal={vi.fn()}
      error={error}
      errorCode={errorCode}
    />
  );
  return screen.getByTestId('billing-status-panel');
};

const checkout = () =>
  useBillingStore.getState().startCheckout('user-1', 'engineer@example.com', 'senior');

beforeEach(() => {
  fetchMock = vi.fn(async () => jsonResponse(503, AUDIT_FAILURE));
  vi.stubGlobal('fetch', fetchMock);
  setAuthTokenGetter(async () => 'test-id-token');
  useBillingStore.getState().setBillingError(null);
  useBillingStore.setState({ isCheckoutLoading: false });
});

afterEach(() => {
  setAuthTokenGetter(null);
});

describe('billing failure propagation', () => {
  it("keeps the backend's code from the provider through the store to the panel copy", async () => {
    await expect(checkout()).rejects.toThrow(/audit logging is unavailable/i);

    // Drop the code anywhere along provider -> store and this is null, leaving the
    // panel able to do nothing but repeat the backend's own sentence.
    expect(useBillingStore.getState().errorCode).toBe('audit_log_unavailable');

    const panel = renderPanelFromStore();

    expect(panel).toHaveTextContent(AUDIT_COPY);
    expect(panel).not.toHaveTextContent(/audit logging is unavailable/i);
  });

  it('never explains a later failure with the code of the one before it', async () => {
    await expect(checkout()).rejects.toThrow(/audit logging is unavailable/i);
    expect(useBillingStore.getState().errorCode).toBe('audit_log_unavailable');

    // A different action, against a transport that is simply down.
    fetchMock.mockImplementation(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(useBillingStore.getState().openCustomerPortal('user-1')).rejects.toThrow(
      UNREACHABLE
    );

    expect(useBillingStore.getState().error).toBe(UNREACHABLE);
    expect(useBillingStore.getState().errorCode).not.toBe('audit_log_unavailable');

    const panel = renderPanelFromStore();

    expect(panel).toHaveTextContent(UNREACHABLE);
    expect(panel).not.toHaveTextContent(AUDIT_COPY);
  });

  it('gives the two transport failures a code of their own instead of prose alone', async () => {
    fetchMock.mockImplementation(async () => {
      throw new DOMException('aborted', 'AbortError');
    });
    await expect(checkout()).rejects.toThrow(/timed out after 30 seconds/i);
    expect(useBillingStore.getState().errorCode).toBe('billing_backend_timeout');

    fetchMock.mockImplementation(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(checkout()).rejects.toThrow(UNREACHABLE);
    expect(useBillingStore.getState().errorCode).toBe('billing_backend_unreachable');
  });
});
