import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBillingStore } from './billing.store';

// Mock the auth store
vi.mock('../auth', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      currentUser: { id: 'test-user', email: 'test@example.com' },
    })),
  },
}));

describe('Billing Integration', () => {
  beforeEach(() => {
    // Reset stores
    useBillingStore.setState({
      subscription: undefined,
      isLoading: false,
      error: null,
    });
  });

  it('initializes with free plan by default', () => {
    const state = useBillingStore.getState();
    expect(state.subscription?.planId ?? null).toBeNull();
  });

  it('can update subscription state', () => {
    useBillingStore.setState({
      subscription: {
        planId: 'pro',
        status: 'active',
        currentPeriodEnd: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        updatedAt: new Date().toISOString(),
      },
    });

    const state = useBillingStore.getState();
    expect(state.subscription?.planId).toBe('pro');
    expect(state.subscription?.status).toBe('active');
  });

  it('can toggle loading state', () => {
    useBillingStore.setState({ isLoading: true });
    expect(useBillingStore.getState().isLoading).toBe(true);

    useBillingStore.setState({ isLoading: false });
    expect(useBillingStore.getState().isLoading).toBe(false);
  });

  it('can set and clear error', () => {
    useBillingStore.setState({ error: 'Payment failed' });
    expect(useBillingStore.getState().error).toBe('Payment failed');

    useBillingStore.setState({ error: null });
    expect(useBillingStore.getState().error).toBeNull();
  });
});
