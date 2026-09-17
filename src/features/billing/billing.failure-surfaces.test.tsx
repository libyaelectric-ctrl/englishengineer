import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { setAuthTokenGetter } from '@/shared/services/auth-backend/backend-auth.service';

import { useAuthStore } from '@/features/auth';

import { AIPage } from '@/pages/AIPage';
import PricingPage from '@/pages/PricingPage';
import { useProfilePage } from '@/pages/ProfilePage/useProfilePage';

import { BillingStatusPanel } from './BillingStatusPanel';
import { CLIENT_SENTENCE_CODE } from './billing.failure-copy';
import { useBillingStore } from './billing.store';

/**
 * Every surface a customer can meet a billing failure on, whatever page it belongs to:
 * the billing panel, the profile page's own upgrade and portal actions, the pricing page,
 * the AI page's credit purchase, and the store's channel for a sentence a client writes
 * itself. Each is driven through its real code against a failure that really happened (a
 * 503 from the checkout endpoint), because the one thing that has to hold everywhere is
 * that the customer reads curated copy and never the backend's own sentence.
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

const htmlResponse = (status: number, body: string): Response =>
  new Response(body, { status, headers: { 'content-type': 'text/html' } });

/**
 * The shapes the audit measured on the real app, each of which reaches the store with
 * no code at all: a response that never carried one, and a body that cannot be read as
 * the error envelope. Every one of them used to print its own sentence.
 */
const CODE_LESS_ENVELOPES: { shape: string; raw: string; make: () => Response }[] = [
  {
    shape: '200 that is not the versioned success envelope',
    raw: 'Backend response does not match the versioned success envelope.',
    make: () => jsonResponse(200, { hello: 'world' }),
  },
  {
    shape: '200 with an HTML body',
    raw: "Unexpected token '<'",
    make: () => htmlResponse(200, '<!DOCTYPE html><html><body>Not found</body></html>'),
  },
  {
    shape: '502 with a gateway HTML body',
    raw: 'API 502:',
    make: () => htmlResponse(502, '<html><body>502 Bad Gateway</body></html>'),
  },
  {
    shape: '503 envelope with no error code',
    raw: 'Audit store offline.',
    make: () => jsonResponse(503, { ok: false, error: { message: 'Audit store offline.' } }),
  },
];

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

/**
 * The page a customer actually starts a checkout on. It runs the checkout itself, so it
 * sees the same failure the panel does and has to resolve it the same way. Rendered and
 * driven for real: the page fetches, the store throws, the page's own catch decides what
 * the customer reads.
 */
const upgradeFromPricingPage = async (): Promise<string> => {
  const page = render(<PricingPage />, { wrapper });

  const cta = await waitFor(() => {
    const buttons = [...page.container.querySelectorAll('button')] as HTMLButtonElement[];
    const paid = buttons.find((button) => /19[.,]99/.test(button.textContent ?? ''));
    if (!paid) throw new Error('paid plan CTA not found');
    return paid;
  });

  fireEvent.click(cta);

  const alert = await waitFor(() => {
    const found = within(page.container).queryByRole('alert');
    if (!found) throw new Error('pricing page showed no failure');
    return found;
  });
  const text = alert.textContent ?? '';
  page.unmount();
  return text;
};

describe('a sentence a surface writes itself', () => {
  it('keeps its wording, because it travels classified under the client channel', () => {
    // The panel's own preconditions (sign in first, demo profiles cannot buy, no email
    // on file) are the client's sentences. They survive only because they are classified
    // under `CLIENT_SENTENCE_CODE`; without a code they would be indistinguishable from a
    // failure that lost one, and the customer would read "service is unavailable" instead.
    const demo = 'Demo profiles cannot make purchases. Create an account to subscribe.';
    useBillingStore.getState().setBillingError(demo);

    expect(useBillingStore.getState().errorCode).toBe(CLIENT_SENTENCE_CODE);

    renderPanelFromStore();

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(demo);
    expect(alert).not.toHaveTextContent(/billing could not be started/i);
  });

  it("keeps the pricing page's own demo-mode refusal specific", async () => {
    // This refusal is copy the page authors, not a failure the backend sent, and it
    // never passes through the resolver. It is pinned here as a recorded decision: the
    // branch could be routed through `resolveBillingError` and still show *something*,
    // which is exactly why the difference has to be visible in a test.
    useAuthStore.getState().enterDemoUser();

    expect(await upgradeFromPricingPage()).toBe('Demo profiles cannot make purchases.');
  });
});

describe('the checkout failure a customer meets on the upgrade page', () => {
  it('answers the audit-logging outage with billing copy, not the backend sentence', async () => {
    stubAuditFailure();

    expect(await upgradeFromPricingPage()).toBe(AUDIT_COPY);
    expect(document.body.textContent).not.toContain(RAW_BACKEND_SENTENCE);
  });

  it.each(CODE_LESS_ENVELOPES)(
    'answers a $shape failure with billing copy on every surface',
    async ({ raw, make }) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => make())
      );
      const profile = renderProfile();
      useBillingStore.getState().setBillingError(null);

      await act(async () => {
        await useBillingStore
          .getState()
          .startCheckout('user-1', 'engineer@example.com', 'senior')
          .catch(() => undefined);
      });

      renderPanelFromStore();

      expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toEqual([AUDIT_COPY]);
      expect(profile.result.current.billingError).toBe(AUDIT_COPY);
      expect(await upgradeFromPricingPage()).toBe(AUDIT_COPY);
      expect(document.body.textContent).not.toContain(raw);
    }
  );
});

describe('the credit purchase on the AI page', () => {
  it('answers a billing failure with billing copy, not the backend sentence', async () => {
    // The page runs the top-up itself through its own hook, and renders the failure in
    // the provider panel it passes to `ProviderStatusPanel` — the same catch that used to
    // print `err.message` raw.
    stubAuditFailure();

    const page = render(<AIPage />, { wrapper });

    fireEvent.click(await screen.findByRole('button', { name: /buy 50 ai credits/i }));

    await waitFor(() => {
      expect(page.container.textContent).toContain(AUDIT_COPY);
    });
    expect(page.container.textContent).not.toContain(RAW_BACKEND_SENTENCE);
  });
});
