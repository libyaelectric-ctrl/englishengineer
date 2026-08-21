import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';

/**
 * Automatically tracks page visits and time spent.
 *
 * Usage: Add `<PageTracker />` to AppShell's main content area.
 *
 * Tracks:
 * - Page view on route change
 * - Time spent on page (on unload/navigation)
 */
export function usePageTracking() {
  const location = useLocation();
  const entryTime = useRef(Date.now());
  const lastPath = useRef(location.pathname);

  // Track page view on route change
  useEffect(() => {
    // Track time on previous page
    if (lastPath.current !== location.pathname) {
      const timeSpent = Math.round((Date.now() - entryTime.current) / 1000);
      if (timeSpent > 2) {
        ProductAnalyticsService.track('screen_viewed', lastPath.current, {
          durationSeconds: timeSpent,
        });
      }
      lastPath.current = location.pathname;
      entryTime.current = Date.now();
    }

    // Track new page view
    ProductAnalyticsService.track('screen_viewed', location.pathname);
  }, [location.pathname]);

  // Track time on page when user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - entryTime.current) / 1000);
      if (timeSpent > 2) {
        ProductAnalyticsService.track('screen_viewed', location.pathname, {
          durationSeconds: timeSpent,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname]);

  return {
    currentPath: location.pathname,
    timeOnPage: Date.now() - entryTime.current,
  };
}
