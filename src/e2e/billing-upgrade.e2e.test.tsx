import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { BillingService, useBillingStore } from '@/features/billing';
import type { SubscriptionSnapshot } from '@/features/billing';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import BillingPage from '@/pages/BillingPage';
import PricingPage from '@/pages/PricingPage';

import { resetStores } from './test-utils/resetStores';

configure({ asyncUtilTimeout: 10000 });

afterEach(() => {
  resetStores();
  vi.restoreAllMocks();
});

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } });

const seedAuthenticatedUser = (userId = 'billing-e2e-user') => {
  useAuthStore.setState({
    currentUser: {
      id: userId,
      displayName: 'Billing E2E',
      email: 'billing-e2e@example.com',
      role: 'engineer',
      engineeringDiscipline: 'software',
      targetLevel: 'B2',
      location: 'Remote',
      avatarInitials: 'BE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    isAuthenticated: true,
    isLoading: false,
  });
  const profile = LearningProfileRepository.getProfile(userId);
  LearningProfileRepository.saveProfile({ ...profile, userId, onboardingCompleted: true });
};

const renderBillingWithRouter = (initialEntries = ['/billing']) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Billing: Upgrade Plan navigation', () => {
  it('renders the Upgrade Plan button', async () => {
    seedAuthenticatedUser();
    renderBillingWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upgrade plan/i })).toBeInTheDocument();
    });
  });

  it('opens the plan list from Upgrade Plan instead of buying an implicit default', async () => {
    seedAuthenticatedUser();
    const startCheckout = vi.spyOn(useBillingStore.getState(), 'startCheckout');
    renderBillingWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upgrade plan/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /upgrade plan/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pricing' })).toBeInTheDocument();
    });
    expect(startCheckout).not.toHaveBeenCalled();

    const specialistCard = screen.getByRole('heading', { name: 'Specialist' }).closest('article');
    await user.click(within(specialistCard as HTMLElement).getByRole('button'));

    await waitFor(() => {
      expect(startCheckout).toHaveBeenCalledWith(
        'billing-e2e-user',
        'billing-e2e@example.com',
        'specialist',
        'month'
      );
    });
  });

  it('returns from checkout with the selected plan active in billing status', async () => {
    seedAuthenticatedUser();
    const freeSubscription: SubscriptionSnapshot = {
      planId: 'free',
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const specialistSubscription: SubscriptionSnapshot = {
      planId: 'specialist',
      status: 'active',
      currentPeriodEnd: '2027-04-24T00:00:00.000Z',
      cancelAtPeriodEnd: false,
      stripeCustomerId: 'cus_billing_e2e',
      stripeSubscriptionId: 'sub_billing_e2e',
      updatedAt: '2026-04-24T00:00:00.000Z',
      source: 'stripe',
    };
    const refreshSubscription = vi
      .spyOn(BillingService, 'refreshSubscription')
      .mockResolvedValue(freeSubscription);
    vi.spyOn(BillingService, 'fetchInvoices').mockResolvedValue([]);
    const startCheckout = vi.spyOn(BillingService, 'startCheckout').mockResolvedValue();
    const user = userEvent.setup();
    const checkoutPage = renderBillingWithRouter();

    await user.click(await screen.findByRole('button', { name: /upgrade plan/i }));
    await user.click(await screen.findByRole('button', { name: 'Annual' }));
    const specialistCard = screen.getByRole('heading', { name: 'Specialist' }).closest('article');
    await user.click(within(specialistCard as HTMLElement).getByRole('button'));

    await waitFor(() => {
      expect(startCheckout).toHaveBeenCalledWith(
        'billing-e2e-user',
        'billing-e2e@example.com',
        'specialist',
        'year'
      );
    });

    checkoutPage.unmount();
    refreshSubscription.mockResolvedValue(specialistSubscription);
    renderBillingWithRouter(['/billing?billing=success']);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /specialist active/i })).toBeInTheDocument();
      expect(screen.getByText(/specialist entitlements active/i)).toBeInTheDocument();
      expect(refreshSubscription).toHaveBeenCalledWith('billing-e2e-user');
    });
  });

  it('Upgrade Plan button is not disabled for free users', async () => {
    seedAuthenticatedUser();
    renderBillingWithRouter();

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /upgrade plan/i });
      expect(btn).not.toBeDisabled();
    });
  });

  it('Billing page shows subscription status for free user', async () => {
    seedAuthenticatedUser();
    renderBillingWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Subscription Entitlements/i)).toBeInTheDocument();
    });
    // Free user should see "Current plan" section with plan details. Match the
    // label exactly: a regex would also match the wrapping element whose text
    // content includes the plan name, which makes the query ambiguous.
    await waitFor(() => {
      expect(screen.getByText('Current plan')).toBeInTheDocument();
    });
  });

  it('BillingUpgradeCTA also links to /pricing', async () => {
    seedAuthenticatedUser();
    renderBillingWithRouter();

    await waitFor(() => {
      // The BillingUpgradeCTA renders a Link to /pricing with text "Upgrade Plan"
      const links = screen.getAllByRole('link', { name: /upgrade plan/i });
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(link).toHaveAttribute('href', '/pricing');
      }
    });
  });

  it('Manage Subscription button exists alongside Upgrade Plan', async () => {
    seedAuthenticatedUser();
    renderBillingWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upgrade plan/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /manage subscription/i })).toBeInTheDocument();
    });
  });
});
