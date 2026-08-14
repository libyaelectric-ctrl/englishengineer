import { useEffect, useRef, useState } from 'react';

/** Default duration of a count-up animation in milliseconds. */
export const COUNT_UP_DURATION_MS = 900;

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Animates `target` with an eased count-up whenever the value changes.
 *
 * The current value is shown immediately on first render; subsequent changes
 * count up from the previously settled value over `durationMs`. Numbers are
 * snapped to integers for display.
 */
export function useCountUp(target: number, durationMs = COUNT_UP_DURATION_MS): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return undefined;

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(progress);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, durationMs]);

  return display;
}
