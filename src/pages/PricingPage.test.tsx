import { fireEvent, render, screen, within } from '@testing-library/react';
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
    const state = { currentUser, initialize: vi.fn() };
    vi.mocked(useAuthStore).mockImplementation(((selector?: (value: typeof state) => unknown) =>
      selector ? selector(state) : state) as typeof useAuthStore);
  };

  const mockBilling = (subscription: { planId: string; status: string }) => {
    const startCheckout = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useBillingStore).mockReturnValue({
      isCheckoutLoading: false,
      startCheckout,
      subscription,
    } as unknown as ReturnType<typeof useBillingStore>);
    return startCheckout;
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

  it('shows the active paid plan and all higher options without offering downgrades', () => {
    mockAuth({ id: 'user-123', email: 'engineer@example.com' });
    mockBilling({ planId: 'senior', status: 'active' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    const senior = screen.getByRole('heading', { name: 'Senior' }).closest('article');
    expect(within(senior as HTMLElement).getByText(/current plan/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Free' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Junior' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Specialist' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Master' })).toBeInTheDocument();
  });

  it('shows all paid plans as eligible choices for a free-tier subscription', () => {
    mockAuth({ id: 'user-123', email: 'engineer@example.com' });
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    for (const tier of PRICING_TIERS.filter((item) => item.id !== 'free')) {
      expect(screen.getByRole('heading', { name: tier.name })).toBeInTheDocument();
    }
  });

  it('marks the free option as current for a free-tier subscription', () => {
    mockAuth({ id: 'user-123', email: 'engineer@example.com' });
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    const free = screen.getByRole('heading', { name: 'Free' }).closest('article');
    expect(within(free as HTMLElement).getByText(/current plan/i)).toBeInTheDocument();

    const junior = screen.getByRole('heading', { name: 'Junior' }).closest('article');
    expect(within(junior as HTMLElement).getByRole('button')).toBeInTheDocument();
  });

  it('sends the exact selected package to checkout instead of choosing a default upgrade', () => {
    mockAuth({ id: 'user-123', email: 'engineer@example.com' });
    const startCheckout = mockBilling({ planId: 'junior', status: 'active' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    for (const tier of PRICING_TIERS.filter((item) => item.id !== 'free')) {
      const card = screen.getByRole('heading', { name: tier.name }).closest('article');
      expect(card).not.toBeNull();
      if (tier.id === 'junior') {
        expect(within(card as HTMLElement).getByText(/current plan/i)).toBeInTheDocument();
      } else {
        expect(within(card as HTMLElement).getByRole('button')).toBeEnabled();
      }
    }

    const specialist = screen.getByRole('heading', { name: 'Specialist' }).closest('article');
    fireEvent.click(within(specialist as HTMLElement).getByRole('button'));

    expect(startCheckout).toHaveBeenCalledWith(
      'user-123',
      'engineer@example.com',
      'specialist',
      'month'
    );
  });

  it('preserves the selected annual billing interval in checkout', () => {
    mockAuth({ id: 'user-123', email: 'engineer@example.com' });
    const startCheckout = mockBilling({ planId: 'senior', status: 'active' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Annual' }));
    const master = screen.getByRole('heading', { name: 'Master' }).closest('article');
    fireEvent.click(within(master as HTMLElement).getByRole('button'));

    expect(startCheckout).toHaveBeenCalledWith(
      'user-123',
      'engineer@example.com',
      'master',
      'year'
    );
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
