import { afterEach, describe, expect, it, vi } from 'vitest';

// A real browser never reaches the provider from a unit test, so the provider
// is stubbed and its response is driven per test.
const mocks = vi.hoisted(() => ({ createCheckoutSession: vi.fn() }));

vi.mock('./stripe.provider', () => ({
  StripeBillingProvider: class {
    createCheckoutSession = mocks.createCheckoutSession;
  },
}));

vi.mock('./billing.helpers', async (importOriginal) => {
  const original = await importOriginal<typeof import('./billing.helpers')>();
  return { ...original, getBillingApiUrl: () => 'https://billing.engvox.test' };
});

import { BillingService } from './billing.service';
import { useBillingStore } from './billing.store';

const checkout = (url: unknown) => mocks.createCheckoutSession.mockResolvedValue({ url });

const startCheckout = () =>
  BillingService.startCheckout('user-123', 'engineer@example.com', 'senior');

describe('billing checkout redirect safety', () => {
  afterEach(() => {
    mocks.createCheckoutSession.mockReset();
  });

  it('reports a missing checkout link instead of silently doing nothing', async () => {
    checkout(undefined);

    await expect(startCheckout()).rejects.toThrow(/did not return a checkout link/i);
  });

  it('reports an unparseable checkout link', async () => {
    checkout('not-a-url');

    await expect(startCheckout()).rejects.toThrow(/invalid checkout link/i);
  });

  it('refuses to open an untrusted checkout host and says so', async () => {
    checkout('https://evil.example.com/session');

    await expect(startCheckout()).rejects.toThrow(/untrusted host/i);
  });

  it('accepts the provider hosts it is allowed to open', async () => {
    for (const url of [
      'https://checkout.stripe.com/c/pay/session',
      'https://checkout.dodopayments.com/session',
      'https://test.checkout.dodopayments.com/session',
    ]) {
      mocks.createCheckoutSession.mockReset();
      checkout(url);

      await expect(startCheckout()).resolves.toBeUndefined();
    }
  });
});

describe('billing checkout loading flag', () => {
  afterEach(() => {
    mocks.createCheckoutSession.mockReset();
    useBillingStore.setState({ isCheckoutLoading: false, error: null });
  });

  it('clears the flag after a failed checkout so the Upgrade button cannot stay stuck', async () => {
    checkout('https://evil.example.com/session');

    await expect(
      useBillingStore.getState().startCheckout('user-123', 'engineer@example.com', 'senior')
    ).rejects.toThrow(/untrusted host/i);

    expect(useBillingStore.getState().isCheckoutLoading).toBe(false);
    expect(useBillingStore.getState().error).toMatch(/untrusted host/i);
  });

  it('clears the flag when the redirect never happens', async () => {
    checkout(undefined);

    await expect(
      useBillingStore.getState().startCheckout('user-123', 'engineer@example.com', 'senior')
    ).rejects.toThrow(/did not return a checkout link/i);

    expect(useBillingStore.getState().isCheckoutLoading).toBe(false);
  });

  it('exposes a setter so a page can report its own precondition failure', () => {
    useBillingStore.getState().setBillingError('Your account has no email address on file.');

    expect(useBillingStore.getState().error).toBe('Your account has no email address on file.');
  });
});
