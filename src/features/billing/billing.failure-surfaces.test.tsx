import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { setAuthTokenGetter } from '@/shared/services/auth-backend/backend-auth.service';

import { useAuthStore } from '@/features/auth';

import { AIPage } from '@/pages/AIPage';
import BillingPage from '@/pages/BillingPage';
import PricingPage from '@/pages/PricingPage';
import ProfilePage from '@/pages/ProfilePage';

import { BillingStatusPanel } from './BillingStatusPanel';
import { DEFAULT_UPGRADE_PLAN_ID } from './billing.entitlements';
import { CLIENT_SENTENCE_CODE } from './billing.failure-copy';
import { BILLING_PLANS } from './billing.helpers';
import { BillingService } from './billing.service';
import { useBillingStore } from './billing.store';

/**
 * Every surface a customer can meet a billing failure on, whatever page it belongs to:
 * the billing panel, the profile page's own upgrade and portal controls, the pricing page,
 * the AI page's credit purchase, and the store's channel for a sentence a client writes
 * itself. Each is driven through its real code against a failure that really happened (a
 * 503 from the checkout endpoint), because the one thing that has to hold everywhere is
 * that the customer reads curated copy and never the backend's own sentence.
 *
 * The profile surface is carried by the page itself, not by its hook: a hook's return value
 * is what the page renders, not what the customer reads.
 *
 * Both real surfaces are rendered from one store state here, so this is also where the
 * upgrade control's own product decision is pinned: two identically-labelled controls have
 * to start the same plan, and a lapsed paid plan has to be offered the same control on
 * both. Neither is visible from inside one surface alone.
 */

/**
 * `useLearningCockpit` must hand back ONE frozen object: a fresh literal per call makes every
 * consumer that lists it as a dependency re-run, and the profile page then re-renders until
 * the event loop blocks. Everything else in the module stays real.
 */
const { mockLearningCockpit } = vi.hoisted(() => ({
  mockLearningCockpit: {
    profile: {
      skills: {
        vocabulary: { elo: 800, cefrBand: 'A1' },
        grammar: { elo: 750, cefrBand: 'A1' },
        reading: { elo: 700, cefrBand: 'A1' },
        writing: { elo: 650, cefrBand: 'A1' },
        speaking: { elo: 600, cefrBand: 'A1' },
        listening: { elo: 700, cefrBand: 'A1' },
      },
    },
    memory: { total: 0, new: 0, learning: 0, mastered: 0, forgotten: 0, dueToday: 0, weakWords: 0 },
    missions: [],
    isLoading: false,
    learningState: { studySessions: [] },
  },
}));

vi.mock('@/features/profile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/profile')>();
  return {
    ...actual,
    useLearningCockpit: vi.fn(() => mockLearningCockpit),
  };
});

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

/**
 * The profile page, not its hook. Its controls and its alert are the surface a customer
 * meets, so they are what these tests drive and read.
 */
const renderProfilePage = () => render(<ProfilePage />, { wrapper });

/**
 * The profile page's single alert: the element that shows a resolved billing failure (and
 * whatever else the page has to say). Requiring it to be unique keeps the assertion about
 * that element instead of about "somewhere in the page".
 */
const profileAlert = (root: HTMLElement): HTMLElement => {
  const alerts = [...root.querySelectorAll<HTMLElement>('[role="status"]')];
  if (alerts.length !== 1) {
    throw new Error(`the profile page rendered ${alerts.length} status regions, expected 1`);
  }
  return alerts[0];
};

const renderPanelFromStore = (): HTMLElement => {
  const { subscription, providerStatus, error, errorCode } = useBillingStore.getState();
  const { container } = render(
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
  return container;
};

beforeEach(() => {
  // Neither the user nor the failure may be inherited from the test that ran before this
  // one. The store is module-level, so a failure left behind by an earlier test would be
  // rendered by the next test's surface as if the backend had just sent it.
  useBillingStore.getState().setBillingError(null);
  useAuthStore
    .getState()
    .loginAsLocal({ email: 'engineer@example.com', displayName: 'Test Engineer' });
});

afterEach(() => {
  setAuthTokenGetter(null);
  vi.unstubAllGlobals();
  useBillingStore.getState().setBillingError(null);
});

describe('the same billing failure on both surfaces', () => {
  it('resolves the store failure to one sentence, with no raw backend wording on either', async () => {
    const page = renderProfilePage();

    // Seeded after mounting: the profile page refreshes billing on mount, which is a
    // different moment from the failure arriving.
    await act(async () => {
      await seedAuditFailure();
    });

    const panel = renderPanelFromStore();

    // Both surfaces are on screen at once, so each is read through its own container.
    expect(profileAlert(page.container)).toHaveTextContent(AUDIT_COPY);
    expect(within(panel).getByRole('alert')).toHaveTextContent(AUDIT_COPY);
    expect(page.container.textContent).not.toContain(RAW_BACKEND_SENTENCE);
    expect(panel.textContent).not.toContain(RAW_BACKEND_SENTENCE);
  });

  it('answers an out-of-contract code with billing copy on both surfaces', async () => {
    const page = renderProfilePage();

    await act(async () => {
      await seedOutOfContractFailure();
    });

    const panel = renderPanelFromStore();

    expect(profileAlert(page.container)).toHaveTextContent(AUDIT_COPY);
    expect(within(panel).getByRole('alert')).toHaveTextContent(AUDIT_COPY);
    expect(page.container.textContent).not.toContain(OUT_OF_CONTRACT_SENTENCE);
  });

  it("resolves the failure the profile page's own upgrade control hits", async () => {
    const page = renderProfilePage();
    stubAuditFailure();

    fireEvent.click(within(page.container).getByRole('button', { name: /upgrade plan/i }));

    await waitFor(() => expect(profileAlert(page.container)).toHaveTextContent(AUDIT_COPY));

    // The store still holds exactly what the backend sent; the page is what curates it.
    expect(useBillingStore.getState().error).toBe(RAW_BACKEND_SENTENCE);
    expect(page.container.textContent).not.toContain(RAW_BACKEND_SENTENCE);
  });
});

/**
 * The subscription-management path. Two surfaces own it: the profile hook's own portal
 * action, and the billing page, which is where the control is actually rendered today
 * (`BillingStatusPanel`'s "Manage Subscription") and which wires the handler itself.
 * A portal request that fails has to be answered like any other billing failure.
 */
/**
 * Puts the account into the state a paying customer's is in. Both pages that offer the
 * portal control gate it on a configured provider and a customer on file, so without this
 * the control is rendered disabled and the failure under test cannot be reached.
 */
const configurePortal = async (): Promise<void> => {
  // The page refreshes billing on mount and that refresh owns `providerStatus`, so the
  // writes below have to land after it has settled or they are the ones that get replaced.
  await waitFor(() => expect(useBillingStore.getState().isLoading).toBe(false));
  await act(async () => undefined);
  useBillingStore.setState({
    providerStatus: {
      mode: 'backend',
      isConfigured: true,
      label: 'Stripe',
      detail: 'Test provider',
    },
    subscription: { ...useBillingStore.getState().subscription, stripeCustomerId: 'cus_test' },
  });
};

const portalFromBillingPage = async (): Promise<string> => {
  const page = render(<BillingPage />, { wrapper });

  await configurePortal();

  fireEvent.click(await screen.findByRole('button', { name: /manage subscription/i }));

  const alert = await waitFor(() => {
    const found = within(page.container).queryByRole('alert');
    if (!found) throw new Error('billing page showed no failure');
    return found;
  });
  const text = alert.textContent ?? '';
  page.unmount();
  return text;
};

describe('the subscription-management path', () => {
  it("resolves the portal failure the profile page's own control hits", async () => {
    stubAuditFailure();
    const page = renderProfilePage();
    await configurePortal();

    const manage = within(page.container).getByRole('button', { name: /manage subscription/i });
    expect(manage).toBeEnabled();
    fireEvent.click(manage);

    await waitFor(() => expect(profileAlert(page.container)).toHaveTextContent(AUDIT_COPY));

    // The store keeps the failed request exactly as it arrived…
    expect(useBillingStore.getState().error).toBe(RAW_BACKEND_SENTENCE);
    expect(useBillingStore.getState().errorCode).toBe('audit_log_unavailable');
    expect(page.container.textContent).not.toContain(RAW_BACKEND_SENTENCE);
  });

  it('answers the portal failure with billing copy on the billing page too', async () => {
    stubAuditFailure();

    expect(await portalFromBillingPage()).toBe(AUDIT_COPY);
    expect(document.body.textContent).not.toContain(RAW_BACKEND_SENTENCE);
  });
});

/**
 * The two refusals the profile hook writes itself. They are the page's own sentences, not
 * failures the backend sent, and they never pass through the resolver — which is exactly why
 * they are pinned: routing those branches through `resolveBillingError` would still show the
 * customer *something*, and the something would be the wrong sentence.
 */
describe("the profile page's own demo-mode refusals", () => {
  const DEMO_UPGRADE = 'Demo mode: Billing is available after connecting Supabase and Stripe.';
  const DEMO_PORTAL =
    'Demo mode: Subscription management available after connecting Supabase + Stripe.';

  it('keeps the upgrade refusal specific instead of the generic billing copy', async () => {
    useAuthStore.getState().enterDemoUser();
    const page = renderProfilePage();

    fireEvent.click(within(page.container).getByRole('button', { name: /upgrade plan/i }));

    await waitFor(() => expect(profileAlert(page.container)).toHaveTextContent(DEMO_UPGRADE));
    expect(profileAlert(page.container).textContent).not.toBe(AUDIT_COPY);
  });

  it('keeps the portal refusal specific instead of the generic billing copy', async () => {
    // The refusal happens before any request, but the page still refreshes billing on mount
    // and that refresh owns `providerStatus`; an unsettled one would keep the control
    // disabled, so it is answered here rather than left to the network.
    stubAuditFailure();
    useAuthStore.getState().enterDemoUser();
    const page = renderProfilePage();
    await configurePortal();

    fireEvent.click(within(page.container).getByRole('button', { name: /manage subscription/i }));

    await waitFor(() => expect(profileAlert(page.container)).toHaveTextContent(DEMO_PORTAL));
    expect(profileAlert(page.container).textContent).not.toBe(AUDIT_COPY);
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
      const page = renderProfilePage();
      useBillingStore.getState().setBillingError(null);

      await act(async () => {
        await useBillingStore
          .getState()
          .startCheckout('user-1', 'engineer@example.com', 'senior')
          .catch(() => undefined);
      });

      const panel = renderPanelFromStore();

      expect(within(panel).getByRole('alert')).toHaveTextContent(AUDIT_COPY);
      expect(profileAlert(page.container)).toHaveTextContent(AUDIT_COPY);
      expect(await upgradeFromPricingPage()).toBe(AUDIT_COPY);
      expect(document.body.textContent).not.toContain(raw);
    }
  );
});

/**
 * The line the purchase control owns: `ProviderStatusPanel` renders the top-up failure as
 * `Error: …` beside the buy button. Asserting on that line, rather than on the page's whole
 * text, is what makes the claim about the control instead of about the document.
 */
const purchaseErrorLine = (root: HTMLElement): string | null =>
  [...root.querySelectorAll('p')].find((p) => p.textContent?.startsWith('Error: '))?.textContent ??
  null;

describe('the credit purchase on the AI page', () => {
  it('answers a billing failure with billing copy, not the backend sentence', async () => {
    // The page runs the top-up itself through its own hook, and renders the failure in
    // the provider panel it passes to `ProviderStatusPanel` — the same catch that used to
    // print `err.message` raw.
    stubAuditFailure();

    const page = render(<AIPage />, { wrapper });

    fireEvent.click(await screen.findByRole('button', { name: /buy 50 ai credits/i }));

    await waitFor(() => {
      expect(purchaseErrorLine(page.container)).toBe(`Error: ${AUDIT_COPY}`);
    });

    // The store still holds the failed request itself; the surface is what curates it.
    expect(useBillingStore.getState().error).toBe(RAW_BACKEND_SENTENCE);

    // The copy is not merely somewhere in the page: it is the purchase control's own line.
    expect(purchaseErrorLine(page.container)).toBe(`Error: ${AUDIT_COPY}`);
    expect(document.body.textContent).not.toContain(RAW_BACKEND_SENTENCE);
  });
});

describe('the upgrade control on every surface', () => {
  const lapsePaidPlan = async (status: string): Promise<void> => {
    useBillingStore.setState({
      subscription: {
        ...useBillingStore.getState().subscription,
        planId: 'senior',
        status: status as never,
      },
    });
    await act(async () => undefined);
  };

  it('is still offered to a paid plan that lapsed', async () => {
    const page = renderProfilePage();
    await waitFor(() => expect(useBillingStore.getState().isLoading).toBe(false));
    await act(async () => undefined);

    await lapsePaidPlan('past_due');

    // The billing page offers this customer an upgrade; the profile page used to answer the
    // same question with a different rule and hide the control from them entirely.
    expect(within(page.container).getByRole('button', { name: /upgrade plan/i })).toBeEnabled();
  });

  it('starts the same plan the billing page starts', async () => {
    const spy = vi.spyOn(BillingService, 'startCheckout').mockResolvedValue(undefined);
    try {
      const profile = renderProfilePage();
      await waitFor(() => expect(useBillingStore.getState().isLoading).toBe(false));
      await act(async () => undefined);
      fireEvent.click(within(profile.container).getByRole('button', { name: /upgrade plan/i }));
      await waitFor(() => expect(spy).toHaveBeenCalled());
      const fromProfile = spy.mock.calls.at(-1)?.[2];
      profile.unmount();

      const billing = render(<BillingPage />, { wrapper });
      await waitFor(() => expect(useBillingStore.getState().isLoading).toBe(false));
      await act(async () => undefined);
      const panel = within(billing.container).getByTestId('billing-status-panel');
      fireEvent.click(within(panel).getByRole('button', { name: /upgrade plan/i }));
      await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
      const fromBilling = spy.mock.calls.at(-1)?.[2];
      billing.unmount();

      expect(fromProfile).toBe(DEFAULT_UPGRADE_PLAN_ID);
      expect(fromBilling).toBe(DEFAULT_UPGRADE_PLAN_ID);
    } finally {
      spy.mockRestore();
    }
  });

  it('gives every upgrade control on the billing page one wording', async () => {
    const billing = render(<BillingPage />, { wrapper });
    await waitFor(() => expect(useBillingStore.getState().isLoading).toBe(false));
    await act(async () => undefined);
    await lapsePaidPlan('canceled');

    const controls = [...billing.container.querySelectorAll('button, a')]
      .map((el) => (el.textContent ?? '').trim().replace(/\s+/g, ' '))
      .filter((label) => /upgrade/i.test(label));

    // Measured on this page before the change: the panel offered this customer "Upgrade Plan"
    // while the CTA directly beneath it, asking its own question, said "Change / Upgrade Plan".
    expect(controls.length).toBeGreaterThan(0);
    expect(new Set(controls)).toEqual(new Set(['Upgrade Plan']));
  });

  it('shows one plan name on both surfaces for an id the catalogue does not know', async () => {
    const page = renderProfilePage();
    await waitFor(() => expect(useBillingStore.getState().isLoading).toBe(false));
    await act(async () => undefined);

    // `team` is a canonical plan id on the backend and has no entry in this catalogue; the
    // payload that carries a plan id is not validated on its way in.
    useBillingStore.setState({
      subscription: { ...useBillingStore.getState().subscription, planId: 'team' as never },
    });
    await act(async () => undefined);

    const planNamesIn = (root: HTMLElement): string => {
      const names = new Set(Object.values(BILLING_PLANS).map((plan) => plan.name));
      const found = [...root.querySelectorAll('*')]
        .filter((el) => el.children.length === 0)
        .map((el) => (el.textContent ?? '').trim())
        .filter((text) => names.has(text));
      return [...new Set(found)].join('|');
    };

    // Neither surface may crash, and neither may invent a second name for the same id.
    expect(planNamesIn(renderPanelFromStore())).toBe(BILLING_PLANS.free.name);
    expect(planNamesIn(page.container)).toBe(BILLING_PLANS.free.name);
  });

  it('offers the portal on both surfaces under exactly the same conditions', async () => {
    const cases = [
      { label: 'configured with a linked customer', isConfigured: true, customerId: 'cus_1' },
      { label: 'configured without a customer', isConfigured: true, customerId: null },
      { label: 'unconfigured with a linked customer', isConfigured: false, customerId: 'cus_1' },
      { label: 'unconfigured without a customer', isConfigured: false, customerId: null },
    ];

    for (const testCase of cases) {
      const page = renderProfilePage();
      await waitFor(() => expect(useBillingStore.getState().isLoading).toBe(false));
      await act(async () => undefined);

      useBillingStore.setState({
        subscription: {
          ...useBillingStore.getState().subscription,
          planId: 'senior',
          status: 'active',
          stripeCustomerId: testCase.customerId,
        },
        providerStatus: {
          ...useBillingStore.getState().providerStatus,
          isConfigured: testCase.isConfigured,
        },
      });
      await act(async () => undefined);

      // Both controls are disabled by the same rule, so neither can be re-split on its own.
      const profileDisabled = within(page.container)
        .getByRole('button', { name: /manage subscription/i })
        .hasAttribute('disabled');
      const panelDisabled = within(renderPanelFromStore())
        .getByRole('button', { name: /manage subscription/i })
        .hasAttribute('disabled');

      expect({ case: testCase.label, disabled: profileDisabled }).toEqual({
        case: testCase.label,
        disabled: panelDisabled,
      });
      page.unmount();
    }
  });
});
