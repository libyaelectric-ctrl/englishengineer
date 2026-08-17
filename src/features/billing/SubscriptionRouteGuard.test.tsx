import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useBillingStore } from '@/features/billing/billing.store';
import type { SubscriptionSnapshot } from '@/features/billing/billing.types';

import { CurriculumSectionGuard } from './CurriculumSectionGuard';
import { SubscriptionRouteGuard } from './SubscriptionRouteGuard';

vi.mock('@/features/billing/billing.store', () => ({
  useBillingStore: vi.fn(),
}));

const freeSubscription: SubscriptionSnapshot = {
  planId: 'free',
  status: 'none',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  updatedAt: '2026-08-17T00:00:00.000Z',
};

const juniorSubscription: SubscriptionSnapshot = {
  ...freeSubscription,
  planId: 'junior',
  status: 'active',
};

const seniorSubscription: SubscriptionSnapshot = {
  ...freeSubscription,
  planId: 'senior',
  status: 'active',
};

const masterSubscription: SubscriptionSnapshot = {
  ...freeSubscription,
  planId: 'master',
  status: 'active',
};

const mockedUseBillingStore = vi.mocked(useBillingStore);

const setSubscription = (subscription: SubscriptionSnapshot) => {
  mockedUseBillingStore.mockImplementation(
    (selector: (state: { subscription: SubscriptionSnapshot }) => unknown) =>
      selector({ subscription })
  );
};

const renderGuardRoutes = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/pricing" element={<div>PRICING PAGE</div>} />
        <Route
          path="/placement"
          element={
            <SubscriptionRouteGuard feature="placementTest">
              <div>PLACEMENT CONTENT</div>
            </SubscriptionRouteGuard>
          }
        />
        <Route
          path="/curriculum/:section"
          element={
            <CurriculumSectionGuard>
              <div>LEARNING HUB CONTENT</div>
            </CurriculumSectionGuard>
          }
        />
        <Route
          path="/translator"
          element={
            <SubscriptionRouteGuard feature="translator">
              <div>TRANSLATOR CONTENT</div>
            </SubscriptionRouteGuard>
          }
        />
        <Route
          path="/tools/:section"
          element={
            <SubscriptionRouteGuard feature="tool">
              <div>TOOLS CONTENT</div>
            </SubscriptionRouteGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('SubscriptionRouteGuard placement test lock', () => {
  beforeEach(() => {
    mockedUseBillingStore.mockReset();
  });

  it('redirects a free-tier user from /placement to /pricing', () => {
    setSubscription(freeSubscription);
    renderGuardRoutes('/placement');

    expect(screen.getByText('PRICING PAGE')).toBeInTheDocument();
    expect(screen.queryByText('PLACEMENT CONTENT')).not.toBeInTheDocument();
  });

  it('renders the placement test for a paid user (junior includes placementTest)', () => {
    setSubscription(juniorSubscription);
    renderGuardRoutes('/placement');

    expect(screen.getByText('PLACEMENT CONTENT')).toBeInTheDocument();
    expect(screen.queryByText('PRICING PAGE')).not.toBeInTheDocument();
  });
});

describe('CurriculumSectionGuard learning hub locks', () => {
  beforeEach(() => {
    mockedUseBillingStore.mockReset();
  });

  it('keeps /curriculum/today free for a free-tier user', () => {
    setSubscription(freeSubscription);
    renderGuardRoutes('/curriculum/today');

    expect(screen.getByText('LEARNING HUB CONTENT')).toBeInTheDocument();
    expect(screen.queryByText('PRICING PAGE')).not.toBeInTheDocument();
  });

  it('redirects a free-tier user from /curriculum/full to /pricing', () => {
    setSubscription(freeSubscription);
    renderGuardRoutes('/curriculum/full');

    expect(screen.getByText('PRICING PAGE')).toBeInTheDocument();
    expect(screen.queryByText('LEARNING HUB CONTENT')).not.toBeInTheDocument();
  });

  it('redirects a free-tier user from /curriculum/memory to /pricing', () => {
    setSubscription(freeSubscription);
    renderGuardRoutes('/curriculum/memory');

    expect(screen.getByText('PRICING PAGE')).toBeInTheDocument();
    expect(screen.queryByText('LEARNING HUB CONTENT')).not.toBeInTheDocument();
  });

  it('renders /curriculum/full for a paid user (junior includes learningHub)', () => {
    setSubscription(juniorSubscription);
    renderGuardRoutes('/curriculum/full');

    expect(screen.getByText('LEARNING HUB CONTENT')).toBeInTheDocument();
    expect(screen.queryByText('PRICING PAGE')).not.toBeInTheDocument();
  });
});

describe('SubscriptionRouteGuard translator lock', () => {
  beforeEach(() => {
    mockedUseBillingStore.mockReset();
  });

  it('redirects a free-tier user from /translator to /pricing', () => {
    setSubscription(freeSubscription);
    renderGuardRoutes('/translator');

    expect(screen.getByText('PRICING PAGE')).toBeInTheDocument();
    expect(screen.queryByText('TRANSLATOR CONTENT')).not.toBeInTheDocument();
  });

  it('renders the translator for a senior user (senior includes translator)', () => {
    setSubscription(seniorSubscription);
    renderGuardRoutes('/translator');

    expect(screen.getByText('TRANSLATOR CONTENT')).toBeInTheDocument();
    expect(screen.queryByText('PRICING PAGE')).not.toBeInTheDocument();
  });
});

describe('SubscriptionRouteGuard tools lock', () => {
  beforeEach(() => {
    mockedUseBillingStore.mockReset();
  });

  it('redirects a free-tier user from /tools/ai to /pricing', () => {
    setSubscription(freeSubscription);
    renderGuardRoutes('/tools/ai');

    expect(screen.getByText('PRICING PAGE')).toBeInTheDocument();
    expect(screen.queryByText('TOOLS CONTENT')).not.toBeInTheDocument();
  });

  it('redirects a senior user from /tools/ai to /pricing (tool requires Master)', () => {
    setSubscription(seniorSubscription);
    renderGuardRoutes('/tools/ai');

    expect(screen.getByText('PRICING PAGE')).toBeInTheDocument();
    expect(screen.queryByText('TOOLS CONTENT')).not.toBeInTheDocument();
  });

  it('renders the tools for a master user (master includes tool)', () => {
    setSubscription(masterSubscription);
    renderGuardRoutes('/tools/ai');

    expect(screen.getByText('TOOLS CONTENT')).toBeInTheDocument();
    expect(screen.queryByText('PRICING PAGE')).not.toBeInTheDocument();
  });
});
