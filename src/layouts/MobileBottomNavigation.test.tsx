import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import {
  useBottomActionBar,
  useBottomActionBarStore,
} from '@/shared/stores/bottom-action-bar.store';

import { MobileBottomNavigation } from './MobileBottomNavigation';

// The global test setup mocks the localization store but not the navigation
// dictionary this component reads, so extend that mock here (same shape as
// Navigation.test.tsx).
vi.mock('@/features/localization', () => ({
  useLocalizationStore: vi.fn((selector: (state: { language: string }) => unknown) =>
    selector({ language: 'en' })
  ),
  NAVIGATION_TRANSLATIONS: { en: {} },
}));

const renderNav = () =>
  render(
    <MemoryRouter>
      <MobileBottomNavigation />
    </MemoryRouter>
  );

/** Stands in for a page-level bar (the grammar drill) that claims the strip. */
const BottomActionBar = ({ active }: { active: boolean }) => {
  useBottomActionBar(active);
  return null;
};

describe('MobileBottomNavigation', () => {
  beforeEach(() => {
    // The store is module-level state; reset it so one test cannot leak into the next.
    useBottomActionBarStore.setState({ activeCount: 0 });
  });

  it('renders the five learning destinations on its own', () => {
    renderNav();
    expect(screen.getAllByRole('link')).toHaveLength(5);
  });

  // TD-027: the grammar drill bar is `fixed bottom-0 z-40` and this nav is
  // `fixed bottom-0 z-30`, so without yielding the bar sits on top of every link
  // and a tap on "Profil" records the current rule as Correct/Review.
  it('renders nothing while a bottom action bar owns the strip, and returns when it leaves', () => {
    const { rerender } = render(
      <MemoryRouter>
        <BottomActionBar active />
        <MobileBottomNavigation />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link')).toBeNull();

    rerender(
      <MemoryRouter>
        <BottomActionBar active={false} />
        <MobileBottomNavigation />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('link')).toHaveLength(5);
  });

  it('keeps its own accounting balanced when several bars mount and unmount', () => {
    render(
      <MemoryRouter>
        <BottomActionBar active />
        <BottomActionBar active />
        <MobileBottomNavigation />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(useBottomActionBarStore.getState().activeCount).toBe(2);
  });
});
