import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { useBillingStore } from '@/features/billing';
import type { SubscriptionSnapshot } from '@/features/billing';

import { Navigation } from './Navigation';

vi.mock('@/features/billing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/billing')>();
  return {
    ...actual,
    useBillingStore: vi.fn(),
  };
});

vi.mock('@/features/localization', () => ({
  useLocalizationStore: vi.fn((selector: (state: { language: string }) => unknown) =>
    selector({ language: 'en' })
  ),
  NAVIGATION_TRANSLATIONS: { en: {} },
}));

vi.mock('@/shared/utils/prefetch', () => ({
  prefetchRoute: vi.fn(),
}));

vi.mock('@/config/navigation.config', () => ({
  NAV_ITEMS: [
    { label: 'Home', href: '/dashboard', icon: () => null },
    {
      label: 'Skills',
      href: null,
      icon: () => null,
      children: [
        { label: 'Vocabulary', href: '/vocabulary', icon: () => null, feature: 'vocabulary' },
        { label: 'Reading', href: '/reading', icon: () => null, feature: 'reading' },
      ],
    },
    { label: 'Team', href: '/team', icon: () => null, comingSoon: true },
  ],
}));

const mockedUseBillingStore = vi.mocked(useBillingStore);

const freeSubscription: SubscriptionSnapshot = {
  planId: 'free',
  status: 'none',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  updatedAt: '2026-08-17T00:00:00.000Z',
};

const masterSubscription: SubscriptionSnapshot = {
  ...freeSubscription,
  planId: 'master',
  status: 'active',
};

const renderNav = (subscription: SubscriptionSnapshot) => {
  mockedUseBillingStore.mockImplementation(
    (selector: (state: { subscription: SubscriptionSnapshot }) => unknown) =>
      selector({ subscription })
  );
  return render(
    <MemoryRouter>
      <Navigation />
    </MemoryRouter>
  );
};

describe('Navigation subscription lock', () => {
  const openSkills = () => fireEvent.click(screen.getByRole('button', { name: /skills/i }));

  it('renders locked menu items with a lock icon for the free tier', () => {
    renderNav(freeSubscription);

    const home = screen.getByText('Home');
    expect(home.closest('a')).toHaveAttribute('href', '/dashboard');

    // Vocabulary is free; Reading requires a paid plan.
    openSkills();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByLabelText('Reading (locked)')).toBeInTheDocument();
  });

  it('unlocks paid features on a paid plan', () => {
    renderNav(masterSubscription);

    openSkills();
    expect(screen.queryByLabelText('Reading (locked)')).not.toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
  });

  it('marks coming-soon items as locked regardless of plan', () => {
    renderNav(masterSubscription);
    expect(screen.getByLabelText('Team (locked)')).toBeInTheDocument();
    expect(screen.getByText('Soon')).toBeInTheDocument();
  });

  it('does not lock free-tier items like Vocabulary', () => {
    renderNav(freeSubscription);
    openSkills();
    expect(screen.queryByLabelText('Vocabulary (locked)')).not.toBeInTheDocument();
  });

  it('opens a modal naming the required plan when a locked item is clicked', () => {
    renderNav(freeSubscription);
    openSkills();

    fireEvent.click(screen.getByLabelText('Reading (locked)'));

    const dialog = screen.getByRole('dialog', { name: 'Upgrade required' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/included in the Senior plan/i)).toBeInTheDocument();
    expect(screen.getByText('Senior')).toBeInTheDocument();
  });

  it('shows a coming-soon modal for Team regardless of plan', () => {
    renderNav(masterSubscription);

    fireEvent.click(screen.getByLabelText('Team (locked)'));

    const dialog = screen.getByRole('dialog', { name: 'Coming soon' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/on its way/i)).toBeInTheDocument();
    expect(screen.queryByText('See plans')).not.toBeInTheDocument();
  });

  it('navigates to pricing from the locked modal via See plans', () => {
    renderNav(freeSubscription);
    openSkills();

    fireEvent.click(screen.getByLabelText('Reading (locked)'));
    fireEvent.click(screen.getByRole('button', { name: 'See plans' }));

    // Modal closes; navigation to /pricing is handled by react-router.
    expect(screen.queryByRole('dialog', { name: 'Upgrade required' })).not.toBeInTheDocument();
  });
});
