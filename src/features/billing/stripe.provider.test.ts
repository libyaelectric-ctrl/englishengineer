import { afterEach, describe, expect, it, vi } from 'vitest';

import { StripeBillingProvider } from './stripe.provider';

const getBackendAuthHeaders = vi.fn();

vi.mock('@/shared/services/backend-auth.service', () => ({
  getBackendAuthHeaders: (...args: unknown[]) => getBackendAuthHeaders(...args),
}));

describe('StripeBillingProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    getBackendAuthHeaders.mockReset();
  });

  it('posts checkout to /api/v1/billing/create-checkout-session with bearer auth', async () => {
    getBackendAuthHeaders.mockResolvedValue({
      Authorization: 'Bearer supabase-access-token',
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: { url: 'https://checkout.stripe.test/session' },
        meta: { contractVersion: '2026-09-07.v1' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new StripeBillingProvider('https://billing.EngVox.test');
    const response = await provider.createCheckoutSession({
      userId: 'user_123',
      email: 'engineer@example.com',
      planId: 'senior',
      successUrl: 'https://app.EngVox.test/profile?billing=success',
      cancelUrl: 'https://app.EngVox.test/profile?billing=cancelled',
    });

    expect(response.url).toBe('https://checkout.stripe.test/session');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://billing.EngVox.test/api/v1/billing/create-checkout-session',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer supabase-access-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          userId: 'user_123',
          email: 'engineer@example.com',
          planId: 'senior',
          successUrl: 'https://app.EngVox.test/profile?billing=success',
          cancelUrl: 'https://app.EngVox.test/profile?billing=cancelled',
        }),
      })
    );
  });

  it('requires a Supabase access token before checkout', async () => {
    getBackendAuthHeaders.mockResolvedValue({
      'X-EngVox-User-Id': 'user_123',
    });

    const provider = new StripeBillingProvider('https://billing.EngVox.test');

    await expect(
      provider.createCheckoutSession({
        userId: 'user_123',
        email: 'engineer@example.com',
        planId: 'senior',
        successUrl: 'https://app.EngVox.test/profile?billing=success',
        cancelUrl: 'https://app.EngVox.test/profile?billing=cancelled',
      })
    ).rejects.toThrow(/sign in with your account before upgrading to pro/i);
  });

  it('keeps a plan id outside the catalogue exactly as the backend sent it', async () => {
    // Nothing validates this payload, and `team` is a canonical plan id on the backend with
    // no catalogue entry here. What such an id means is decided by the catalogue owner
    // (`resolvePlan`), so this boundary hands it over unchanged; normalising or rejecting it
    // here would change what that customer is told by accident instead of by decision.
    getBackendAuthHeaders.mockResolvedValue({ Authorization: 'Bearer supabase-access-token' });

    const payload = {
      planId: 'team',
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: 'cus_team',
      stripeSubscriptionId: 'sub_team',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: payload,
        meta: { contractVersion: '2026-09-07.v1' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new StripeBillingProvider('https://billing.EngVox.test');
    const subscription = await provider.getSubscriptionStatus('user_123');

    expect(subscription.planId).toBe('team');
    expect(subscription).toEqual(payload);
  });
});
