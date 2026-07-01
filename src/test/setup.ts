import { afterEach, vi } from 'vitest';

let cleanupDom: (() => void) | undefined;
if (typeof document !== 'undefined') {
  await import('@testing-library/jest-dom/vitest');
  cleanupDom = (await import('@testing-library/react')).cleanup;
}

afterEach(() => {
  cleanupDom?.();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  if (typeof localStorage !== 'undefined') localStorage.clear();
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
});
