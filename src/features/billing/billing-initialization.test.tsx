import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SubscriptionRouteGuard } from './SubscriptionRouteGuard';
import { hasActivePaidAccess } from './billing.entitlements';
import { createFreeSubscription } from './billing.helpers';

const state = vi.hoisted(() => ({
  billing: {
    subscription: { planId: 'free', status: 'none' },
    isLoading: false,
    initializedUserId: null as string | null,
    syncError: null as string | null,
    lastSyncedAt: null as string | null,
  },
  auth: { currentUser: { id: 'signed-in-user' } },
}));
vi.mock('@/features/auth', () => ({
  useAuthStore: (selector: (value: typeof state.auth) => unknown) => selector(state.auth),
}));
vi.mock('./billing.store', () => ({
  useBillingStore: (selector: (value: typeof state.billing) => unknown) => selector(state.billing),
}));
const Page = () => (
  <MemoryRouter initialEntries={['/reading']}>
    <Routes>
      <Route
        path="/reading"
        element={
          <SubscriptionRouteGuard feature="reading">
            <input aria-label="draft" defaultValue="Saved work" />
          </SubscriptionRouteGuard>
        }
      />
      <Route path="/pricing" element={<div>Pricing destination</div>} />
    </Routes>
  </MemoryRouter>
);

describe('subscription initialization', () => {
  beforeEach(() => {
    Object.assign(state.billing, {
      subscription: { planId: 'free', status: 'none' },
      isLoading: false,
      initializedUserId: null,
      syncError: null,
      lastSyncedAt: null,
    });
  });
  it('waits for this user before redirecting to pricing', () => {
    render(<Page />);
    expect(screen.getByText('Checking your subscription')).toBeInTheDocument();
    expect(screen.queryByText('Pricing destination')).not.toBeInTheDocument();
  });
  it('does not unmount a lesson while refreshing an already verified subscription', () => {
    Object.assign(state.billing, {
      subscription: { planId: 'senior', status: 'active' },
      initializedUserId: 'signed-in-user',
      lastSyncedAt: new Date().toISOString(),
    });
    const view = render(<Page />);
    const input = screen.getByLabelText('draft');
    state.billing.isLoading = true;
    view.rerender(<Page />);
    expect(screen.getByLabelText('draft')).toBe(input);
  });
  it('shows a retry state instead of pricing when initial verification fails', () => {
    Object.assign(state.billing, { initializedUserId: 'signed-in-user', syncError: 'Offline' });
    render(<Page />);
    expect(screen.getByRole('alert')).toHaveTextContent('Offline');
    expect(screen.queryByText('Pricing destination')).not.toBeInTheDocument();
  });
  it('grace access expires without waiting for another webhook', () => {
    const subscription = {
      ...createFreeSubscription(),
      planId: 'senior',
      status: 'past_due' as const,
    };
    expect(
      hasActivePaidAccess({
        ...subscription,
        gracePeriodEndsAt: new Date(Date.now() + 60000).toISOString(),
      })
    ).toBe(true);
    expect(
      hasActivePaidAccess({
        ...subscription,
        gracePeriodEndsAt: new Date(Date.now() - 60000).toISOString(),
      })
    ).toBe(false);
  });
});
