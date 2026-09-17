import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { setAuthTokenGetter } from '@/shared/services/auth-backend/backend-auth.service';

import { useAuthStore } from '@/features/auth';
import { BillingStatusPanel } from '@/features/billing/BillingStatusPanel';
import { useBillingStore } from '@/features/billing/billing.store';

import { useProfilePage } from './useProfilePage';

/**
 * The two surfaces that render a billing failure must agree on it, and neither may
 * print the backend's own sentence. Both are driven through their real code — the
 * profile page through its own hook, the billing page through its panel — against a
 * failure that really happened (a 503 from the checkout endpoint).
 */

const AUDIT_COPY =
  'Billing could not be started because the service is temporarily unavailable. Please try again in a few minutes.';
const RAW_BACKEND_SENTENCE = 'Required audit logging is unavailable.';

/** Measured on the real app (malformed billing body): 400 `entity.parse.failed`. */
const OUT_OF_CONTRACT_CODE = 'entity.parse.failed';
const OUT_OF_CONTRACT_SENTENCE = 'Unexpected end of JSON input';

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** Every billing request fails the way the backend does when audit logging is down. */
const stubAuditFailure = (): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      jsonResponse(503, {
        ok: false,
        error: { code: 'audit_log_unavailable', message: RAW_BACKEND_SENTENCE },
      })
    )
  );
  setAuthTokenGetter(async () => 'test-id-token');
};

/** Fails a real checkout, leaving the store holding the backend's raw failure. */
const seedAuditFailure = async (): Promise<void> => {
  stubAuditFailure();
  useBillingStore.getState().setBillingError(null);

  await expect(
    useBillingStore.getState().startCheckout('user-1', 'engineer@example.com', 'senior')
  ).rejects.toThrow(/audit logging is unavailable/i);
  expect(useBillingStore.getState().error).toBe(RAW_BACKEND_SENTENCE);
};

/** Fails a real checkout with a code that is not in the contract at all. */
const seedOutOfContractFailure = async (): Promise<void> => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      jsonResponse(400, {
        ok: false,
        error: { code: OUT_OF_CONTRACT_CODE, message: OUT_OF_CONTRACT_SENTENCE },
      })
    )
  );
  setAuthTokenGetter(async () => 'test-id-token');
  useBillingStore.getState().setBillingError(null);

  await expect(
    useBillingStore.getState().startCheckout('user-1', 'engineer@example.com', 'senior')
  ).rejects.toThrow(/Unexpected end of JSON input/);
  expect(useBillingStore.getState().error).toBe(OUT_OF_CONTRACT_SENTENCE);
  expect(useBillingStore.getState().errorCode).toBe(OUT_OF_CONTRACT_CODE);
};

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

const renderProfile = () => renderHook(() => useProfilePage(), { wrapper });

const renderPanelFromStore = (): void => {
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
    />,
    { wrapper }
  );
};

beforeEach(() => {
  useAuthStore
    .getState()
    .loginAsLocal({ email: 'engineer@example.com', displayName: 'Test Engineer' });
});

afterEach(() => {
  setAuthTokenGetter(null);
});

describe('the same billing failure on both surfaces', () => {
  it('resolves the store failure to one sentence, with no raw backend wording on either', async () => {
    const profile = renderProfile();

    // Seeded after mounting: the profile page refreshes billing on mount, which is a
    // different moment from the failure arriving.
    await act(async () => {
      await seedAuditFailure();
    });

    renderPanelFromStore();

    // The billing surface renders the curated sentence…
    const rendered = screen.getByText(AUDIT_COPY);

    // …and the profile surface resolves to exactly the same one, not the backend's.
    expect(profile.result.current.billingError).toBe(AUDIT_COPY);
    expect(rendered.textContent).toBe(profile.result.current.billingError);
    expect(rendered.textContent).not.toContain(RAW_BACKEND_SENTENCE);
  });

  it('answers an out-of-contract code with billing copy on both surfaces', async () => {
    const profile = renderProfile();

    await act(async () => {
      await seedOutOfContractFailure();
    });

    renderPanelFromStore();

    expect(screen.getByText(AUDIT_COPY).textContent).toBe(AUDIT_COPY);
    expect(profile.result.current.billingError).toBe(AUDIT_COPY);
    expect(screen.queryByText(OUT_OF_CONTRACT_SENTENCE)).toBeNull();
  });

  it("resolves the failure the profile page's own upgrade hits, not just the store's", async () => {
    const profile = renderProfile();
    stubAuditFailure();

    await act(async () => {
      await profile.result.current.handleUpgrade();
    });

    expect(useBillingStore.getState().error).toBe(RAW_BACKEND_SENTENCE);
    expect(profile.result.current.error).toBe(AUDIT_COPY);
  });
});
