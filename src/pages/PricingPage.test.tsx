import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';

import PricingPage from './PricingPage';

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn(),
}));

// PricingPage imports useBillingStore from the subpath, so mock that module
// (the barrel mock above would not intercept it).
vi.mock('@/features/billing/billing.store', () => ({
  useBillingStore: vi.fn(),
}));

vi.mock('@/features/localization', () => ({
  useLocalizationStore: vi.fn(
    (
      selector?: (state: {
        language: string;
        translate: (key: string) => string;
        setLanguage: () => void;
      }) => unknown
    ) => {
      const state = {
        language: 'en',
        translate: (key: string) => key,
        setLanguage: vi.fn(),
      };
      return selector ? selector(state) : state;
    }
  ),
  INTERFACE_LANGUAGES: [
    { id: 'en', flag: '🇬🇧', label: 'English', nativeLabel: 'English', available: true, dir: 'ltr' },
  ],
}));

describe('PricingPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockAuth = (currentUser: unknown) => {
    vi.mocked(useAuthStore).mockReturnValue({
      currentUser,
      initialize: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>);
  };

  const mockBilling = (subscription: { planId: string; status: string }) => {
    vi.mocked(useBillingStore).mockReturnValue({
      isLoading: false,
      startCheckout: vi.fn(),
      subscription,
    } as unknown as ReturnType<typeof useBillingStore>);
  };

  it('renders all 5 pricing tiers', () => {
    mockAuth(null);
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Junior').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Senior').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Specialist').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Master').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Team').length).toBeGreaterThan(0);
  });

  it('shows Most Popular badge on Senior plan', () => {
    mockAuth(null);
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    const badges = screen.getAllByText(/Most Popular|pricing.mostPopular/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('shows Coming Soon badge on Team plan', () => {
    mockAuth(null);
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    const badges = screen.getAllByText(/Coming Soon|pricing.comingSoon/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('shows current plan indicator for active subscription', () => {
    mockAuth({ id: 'user-123', email: 'engineer@example.com' });
    mockBilling({ planId: 'senior', status: 'active' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Current plan|pricing.currentPlan/i)).toBeInTheDocument();
  });

  it('displays correct prices', () => {
    mockAuth(null);
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('$29')).toBeInTheDocument();
    expect(screen.getByText('$59')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
  });
});
