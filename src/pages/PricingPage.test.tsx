import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';

import PricingPage from './PricingPage';

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

vi.mock('@/features/localization', () => ({
  useLocalizationStore: vi.fn((selector?: (state: unknown) => unknown) => {
    const state = {
      language: 'en',
      translate: (_key: string) => _key,
      setLanguage: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
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

    expect(screen.getByText('Junior')).toBeInTheDocument();
    expect(screen.getByText('Senior')).toBeInTheDocument();
    expect(screen.getByText('Specialist')).toBeInTheDocument();
    expect(screen.getByText('Master')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('shows Most Popular badge on Senior plan', () => {
    mockAuth(null);
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Most Popular/i)).toBeInTheDocument();
  });

  it('shows Coming Soon badge on Team plan', () => {
    mockAuth(null);
    mockBilling({ planId: 'junior', status: 'none' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    // Badge shows "Coming Soon" or the translation key
    expect(screen.getByText(/Coming Soon|pricing\.comingSoon/i)).toBeInTheDocument();
  });

  it('shows current plan indicator for active subscription', () => {
    mockAuth({ id: 'user-123', email: 'engineer@example.com' });
    mockBilling({ planId: 'senior', status: 'active' });

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Current plan|pricing\.currentPlan/i)).toBeInTheDocument();
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