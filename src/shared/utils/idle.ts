/**
 * Safe wrapper around `requestIdleCallback`.
 *
 * `requestIdleCallback` is NOT supported in Safari/WebKit as of this
 * writing (MDN lists it as "Limited availability" / not Baseline — Safari
 * either lacks it entirely or ships a buggy experimental version that can
 * fail to ever invoke the callback). Since Safari/WebKit powers every
 * browser on iOS (Chrome, Firefox, etc. on iOS are all WebKit under Apple's
 * App Store rules), calling `requestIdleCallback` directly without a
 * feature check either throws (`TypeError: requestIdleCallback is not a
 * function`) or silently never fires, on a large fraction of mobile
 * traffic.
 *
 * Falls back to `setTimeout` (effectively "next tick", not true idle
 * detection) when unavailable — still deferred off the critical rendering
 * path, just without the browser-idle scheduling guarantee.
 */

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export const runWhenIdle = (callback: () => void, timeoutMs = 200): (() => void) => {
  const w = window as IdleWindow;

  if (typeof w.requestIdleCallback === 'function') {
    const handle = w.requestIdleCallback(callback, { timeout: timeoutMs });
    return () => w.cancelIdleCallback?.(handle);
  }

  const timeoutId = window.setTimeout(callback, 1);
  return () => window.clearTimeout(timeoutId);
};
