import { afterEach, describe, expect, it, vi } from 'vitest';
import { StripeBillingProvider } from './stripe.provider';

const getBackendAuthHeaders = vi.fn();

vi.mock('@/features/auth/backend-auth', () => ({
  getBackendAuthHeaders: (...args: unknown[]) => getBackendAuthHeaders(...args),
}));

describe('StripeBillingProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    getBackendAuthHeaders.mockReset();
  });

  it('posts checkout to /api/billing/create-checkout-session with bearer auth', async () => {
    getBackendAuthHeaders.mockResolvedValue({
      Authorization: 'Bearer supabase-access-token',
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.test/session' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new StripeBillingProvider('https://billing.EngVox.test');
    const response = await provider.createCheckoutSession({
      userId: 'user_123',
      email: 'engineer@example.com',
      planId: 'pro',
      successUrl: 'https://app.EngVox.test/profile?billing=success',
      cancelUrl: 'https://app.EngVox.test/profile?billing=cancelled',
    });

    expect(response.url).toBe('https://checkout.stripe.test/session');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://billing.EngVox.test/api/billing/create-checkout-session',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer supabase-access-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          userId: 'user_123',
          email: 'engineer@example.com',
          planId: 'pro',
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
        planId: 'pro',
        successUrl: 'https://app.EngVox.test/profile?billing=success',
        cancelUrl: 'https://app.EngVox.test/profile?billing=cancelled',
      })
    ).rejects.toThrow(/sign in with your account before upgrading to pro/i);
  });
});
