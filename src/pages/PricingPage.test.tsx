import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { PRICING_TIERS, formatPrice } from '@/shared/data/pricing.data';

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

  it('renders every tier in the pricing model', () => {
    mockAuth(null);
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    // Data-driven off PRICING_TIERS so this cannot drift again — the previous
    // version asserted the removed 'Team' tier by name.
    expect(PRICING_TIERS).toHaveLength(5);
    for (const tier of PRICING_TIERS) {
      expect(screen.getByRole('heading', { name: tier.name })).toBeInTheDocument();
    }
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

  it('does not show Coming Soon badges (all tiers are currently available)', () => {
    mockAuth(null);
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    expect(PRICING_TIERS.some((tier) => tier.comingSoon)).toBe(false);
    expect(screen.queryByText(/Coming Soon|pricing.comingSoon/i)).not.toBeInTheDocument();
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

  it('displays the current monthly price on each paid tier', () => {
    mockAuth(null);
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    // Data-driven off PRICING_TIERS so future price changes don't rot the
    // assertions. Struck-through original prices can equal another tier's
    // current price (e.g. $59.99), so scope each lookup to its own card.
    for (const tier of PRICING_TIERS) {
      if (tier.monthlyPrice === 0) continue; // Free renders as "Free"
      const card = screen.getByRole('heading', { name: tier.name }).closest('article');
      expect(card).not.toBeNull();
      expect(
        within(card as HTMLElement).getByText(formatPrice(tier.monthlyPrice, 'USD'))
      ).toBeInTheDocument();
    }
  });
});
