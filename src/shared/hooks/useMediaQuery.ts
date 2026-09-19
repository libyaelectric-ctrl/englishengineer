/**
 * Viewport media-query hook.
 *
 * Reactive `window.matchMedia`, for the few places where a layout decision has to
 * be behavioural (which controls to render, what the primary action does) and CSS
 * `hidden lg:block` alone cannot express it. Layout-only differences should stay
 * in CSS; reach for this when the DOM itself must change.
 */
import { useEffect, useState } from 'react';

const canMatchMedia = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

export const useMediaQuery = (query: string, defaultValue = false): boolean => {
  const [matches, setMatches] = useState(() => {
    if (!canMatchMedia()) return defaultValue;
    try {
      return window.matchMedia(query).matches;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (!canMatchMedia()) return;
    const list = window.matchMedia(query);
    // Re-read on mount: the query can change between the initial render and the
    // effect (route transitions, SSR hydration) and the first value is only a guess.
    setMatches(list.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener?.('change', onChange);
    return () => list.removeEventListener?.('change', onChange);
  }, [query]);

  return matches;
};
