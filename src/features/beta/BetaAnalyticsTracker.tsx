import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBetaStore } from './beta.store';
import { BetaService } from './beta.service';

export const BetaAnalyticsTracker = () => {
  const location = useLocation();
  const trackScreen = useBetaStore((state) => state.trackScreen);

  useEffect(() => {
    const startedAt = Date.now();
    trackScreen(location.pathname);
    return () => {
      BetaService.trackEvent(
        'screen_duration',
        location.pathname,
        Math.max(1, Math.round((Date.now() - startedAt) / 1000))
      );
    };
  }, [location.pathname, trackScreen]);

  return null;
};
