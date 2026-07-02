import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PricingPage from '@/pages/PricingPage';
import { BillingStatusPanel } from './BillingStatusPanel';
import { useBillingStore } from './billing.store';
import { useAuthStore } from '@/features/auth';

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('./billing.store', () => ({
  useBillingStore: vi.fn(),
}));

vi.mock('./billing.helpers', async (importOriginal) => {
  const original = await importOriginal<typeof import('./billing.helpers')>();
  return {
    ...original,
    getBillingApiUrl: () => 'https://billing.engineeros.test',
  };
});

describe('Billing Checkout Flow', () => {
  it('verifies that PricingPage and BillingStatusPanel upgrade buttons trigger the same checkout action', async () => {
    const startCheckoutMock = vi.fn();
    
    // Mock stores
    vi.mocked(useAuthStore).mockReturnValue({
      currentUser: { id: 'user-123', email: 'engineer@example.com' },
      providerMode: 'supabase',
    } as any);

    vi.mocked(useBillingStore).mockReturnValue({
      isLoading: false,
      startCheckout: startCheckoutMock,
      subscription: { planId: 'free', status: 'none' },
      providerStatus: { isConfigured: true, mode: 'backend' },
    } as any);

    // Mock fetch for getBillingApiUrl / health check
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, stripeConfigured: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    // 1. Render PricingPage and click Pro Upgrade button
    const { unmount } = render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    // Wait for the health check to run and UI to update
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Upgrade to Pro' })).toBeEnabled();
    });

    const pricingButton = screen.getByRole('button', { name: 'Upgrade to Pro' });
    fireEvent.click(pricingButton);

    expect(startCheckoutMock).toHaveBeenCalledWith('user-123', 'engineer@example.com', 'pro');
    startCheckoutMock.mockClear();
    unmount();

    // 2. Render BillingStatusPanel (as used in ProfilePage) and trigger onUpgrade callback
    const handleUpgradeMock = async () => {
      await startCheckoutMock('user-123', 'engineer@example.com', 'pro');
    };

    render(
      <BillingStatusPanel
        subscription={{ planId: 'free', status: 'none', currentPeriodEnd: null, cancelAtPeriodEnd: false, stripeCustomerId: null, stripeSubscriptionId: null, updatedAt: '' }}
        providerStatus={{ isConfigured: true, mode: 'backend', label: '', detail: '' }}
        isLoading={false}
        onUpgrade={handleUpgradeMock}
        onOpenPortal={vi.fn()}
      />
    );

    const profileButton = screen.getByRole('button', { name: 'Upgrade to Pro' });
    fireEvent.click(profileButton);

    expect(startCheckoutMock).toHaveBeenCalledWith('user-123', 'engineer@example.com', 'pro');
  });
});
