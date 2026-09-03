import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import BillingPage from '@/pages/BillingPage';

import { resetStores } from './test-utils/resetStores';

configure({ asyncUtilTimeout: 10000 });

afterEach(() => {
  resetStores();
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
          <Route path="/pricing" element={<div data-testid="pricing-page">Pricing Page</div>} />
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

  it('navigates to /pricing when Upgrade Plan is clicked', async () => {
    seedAuthenticatedUser();
    renderBillingWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upgrade plan/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /upgrade plan/i }));

    await waitFor(() => {
      expect(screen.getByTestId('pricing-page')).toBeInTheDocument();
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
    // Free user should see "Current plan" section with plan details
    await waitFor(() => {
      expect(screen.getByText(/Current plan/i)).toBeInTheDocument();
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
