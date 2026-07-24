import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PricingPage from './PricingPage';
import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/features/billing', async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>;
  return {
    ...original,
    useBillingStore: vi.fn(),
  };
});

vi.mock('@/features/billing/billing.helpers', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getBillingApiUrl: () => 'https://billing.EngVox.test',
  };
});

describe('PricingPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Start Free guest goes to signup', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      currentUser: null,
      initialize: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(useBillingStore).mockReturnValue({
      isLoading: false,
      startCheckout: vi.fn(),
      subscription: { planId: 'free', status: 'none' },
    } as unknown as ReturnType<typeof useBillingStore>);

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    const startFreeLinks = screen.getAllByRole('link', { name: 'Start free' });
    expect(startFreeLinks[startFreeLinks.length - 1]).toHaveAttribute(
      'href',
      '/start'
    );
  });

  it('authenticated user goes to dashboard', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      currentUser: { id: 'user-123', email: 'engineer@example.com' },
      initialize: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(useBillingStore).mockReturnValue({
      isLoading: false,
      startCheckout: vi.fn(),
      subscription: { planId: 'free', status: 'none' },
    } as unknown as ReturnType<typeof useBillingStore>);

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('link', { name: 'Go to dashboard' })
    ).toHaveAttribute('href', '/dashboard');
  });

  it('successful billing health check clears the unavailable warning', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      currentUser: null,
      initialize: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(useBillingStore).mockReturnValue({
      isLoading: false,
      startCheckout: vi.fn(),
      subscription: { planId: 'free', status: 'none' },
    } as unknown as ReturnType<typeof useBillingStore>);

    // Mock global fetch to return success health check
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stripeConfigured: true }),
    } as unknown as Response);

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Billing service is unavailable/i)).toBeNull();
    });

    fetchSpy.mockRestore();
  });

  it('failed health check disables checkout buttons', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      currentUser: null,
      initialize: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(useBillingStore).mockReturnValue({
      isLoading: false,
      startCheckout: vi.fn(),
      subscription: { planId: 'free', status: 'none' },
    } as unknown as ReturnType<typeof useBillingStore>);

    // Mock global fetch to return failure
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const checkoutButtons = screen.getAllByRole('button', {
        name: /upgrade/i,
      });
      checkoutButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    fetchSpy.mockRestore();
  });

  it('Pro user does not see a false billing failure', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      currentUser: { id: 'user-123', email: 'engineer@example.com' },
      initialize: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(useBillingStore).mockReturnValue({
      isLoading: false,
      startCheckout: vi.fn(),
      subscription: { planId: 'pro', status: 'active' },
    } as unknown as ReturnType<typeof useBillingStore>);

    // Mock global fetch to return failure
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    // The unavailable warning should be hidden because planId is 'pro'
    await waitFor(() => {
      expect(
        screen.queryByText(/Stripe backend health check failed/i)
      ).toBeNull();
    });

    // Pro user sees the Current plan disabled button
    expect(screen.getByRole('button', { name: 'Current plan' })).toBeDisabled();

    fetchSpy.mockRestore();
  });
});
