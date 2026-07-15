type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const PATTERNS: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
};

export const haptic = (pattern: HapticPattern = 'light'): void => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  navigator.vibrate(PATTERNS[pattern] ?? PATTERNS.light);
};

export const canVibrate = (): boolean =>
  typeof navigator !== 'undefined' && 'vibrate' in navigator;
