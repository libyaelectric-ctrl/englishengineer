export const MAX_HEARTS = 5;
const REFILL_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours after hearts hit 0

/**
 * Duolingo-style hearts: lose one per wrong answer on a gradeable (right/wrong)
 * exercise, such as a Vocabulary review card. When hearts reach 0, further
 * attempts are blocked until a full 24h has passed since the moment they hit
 * 0 -- at which point they refill back to MAX_HEARTS in one go (no gradual
 * regen, no ad-based refill, since neither exists in this app).
 */
export const loseHeart = (
  currentHearts: number,
  depletedAt: string | null,
  now: Date
): { hearts: number; depletedAt: string | null } => {
  const next = Math.max(0, currentHearts - 1);
  // Only stamp depletedAt the moment hearts actually reach 0.
  if (next === 0 && currentHearts > 0) {
    return { hearts: 0, depletedAt: now.toISOString() };
  }
  return { hearts: next, depletedAt };
};

/**
 * Call before reading/using hearts. If a 24h cooldown has elapsed since
 * hearts were depleted, refills to MAX_HEARTS and clears depletedAt.
 * Returns the input unchanged if no refill is due.
 */
export const refillHeartsIfDue = (
  currentHearts: number,
  depletedAt: string | null,
  now: Date
): { hearts: number; depletedAt: string | null } => {
  if (currentHearts > 0 || !depletedAt) {
    return { hearts: currentHearts, depletedAt };
  }
  const elapsed = now.getTime() - new Date(depletedAt).getTime();
  if (elapsed >= REFILL_AFTER_MS) {
    return { hearts: MAX_HEARTS, depletedAt: null };
  }
  return { hearts: currentHearts, depletedAt };
};

/** Milliseconds remaining until hearts refill, or 0 if not depleted / already due. */
export const msUntilRefill = (depletedAt: string | null, now: Date): number => {
  if (!depletedAt) return 0;
  const remaining = new Date(depletedAt).getTime() + REFILL_AFTER_MS - now.getTime();
  return Math.max(0, remaining);
};
