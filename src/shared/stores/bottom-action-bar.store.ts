/**
 * Bottom action bar presence.
 *
 * A page can pin an action bar to the bottom of the viewport (the grammar drill's
 * Correct/Review bar), and the app shell pins the mobile navigation there too. Both
 * are `fixed bottom-0`, so whichever has the higher `z-index` wins and the other
 * becomes dead pixels — or worse, a tap aimed at navigation lands on the bar and
 * records a review result (docs/TECH_DEBT.md, TD-027).
 *
 * The two live in different components, so the bar *declares* that it occupies the
 * strip and `MobileBottomNavigation` stays out of the way while it does. A counter
 * (not a boolean) keeps this correct if more than one bar is ever mounted.
 */
import { create } from 'zustand';

import { useEffect } from 'react';

/**
 * The exact breakpoint the bar hides at (Tailwind `md:hidden` = hidden from 768px).
 * Kept next to the store so the declaration and the CSS cannot drift apart: if the
 * bar stops rendering at this width it must stop claiming the strip as well.
 */
export const BOTTOM_ACTION_BAR_QUERY = '(max-width: 767px)';

interface BottomActionBarState {
  activeCount: number;
  claim: () => void;
  release: () => void;
}

export const useBottomActionBarStore = create<BottomActionBarState>((set) => ({
  activeCount: 0,
  claim: () => set((state) => ({ activeCount: state.activeCount + 1 })),
  release: () => set((state) => ({ activeCount: Math.max(0, state.activeCount - 1) })),
}));

/** Call from the bar's own component with whether it is currently on screen. */
export const useBottomActionBar = (active: boolean): void => {
  const claim = useBottomActionBarStore((state) => state.claim);
  const release = useBottomActionBarStore((state) => state.release);

  useEffect(() => {
    if (!active) return undefined;
    claim();
    return () => release();
  }, [active, claim, release]);
};

/** Read from the navigation shell to step aside while a bar owns the bottom strip. */
export const useHasBottomActionBar = (): boolean =>
  useBottomActionBarStore((state) => state.activeCount > 0);
