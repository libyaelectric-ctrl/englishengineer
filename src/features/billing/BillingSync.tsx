import { useEffect, useRef } from 'react';

import { logger } from '@/shared/logger';
import { isNativePlatform } from '@/shared/utils/capacitor';

import { useAuthStore } from '@/features/auth';

import { createFreeSubscription } from './billing.helpers';
import { useBillingStore } from './billing.store';

/**
 * Loads the subscription once per signed-in user and clears it on sign-out.
 * In a cold browser (fresh localStorage) a paying user must not run the whole
 * app with `free` entitlements until they happen to visit Profile/Billing —
 * route guards would otherwise redirect them away from paid content even
 * though the payment exists.
 */
export const BillingSync = () => {
  const userId = useAuthStore((state) => state.currentUser?.id ?? null);
  const lastUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (lastUserId.current === userId) return;
    lastUserId.current = userId;

    if (userId) {
      if (userId.startsWith('demo_')) return;
      void useBillingStore.getState().initializeBilling(userId);
    } else {
      // Never leak the previous user's cached subscription into the next
      // session on the same device.
      useBillingStore.getState().setSubscription(createFreeSubscription());
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || userId.startsWith('demo_')) return;
    let disposed = false;
    let removeNative: (() => Promise<void>) | undefined;
    const refresh = () => {
      if (!disposed && !useBillingStore.getState().isLoading)
        void useBillingStore.getState().refreshBilling(userId);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    if (isNativePlatform()) {
      void import('@capacitor/app')
        .then(async ({ App }) => {
          const listener = await App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) refresh();
          });
          if (disposed) await listener.remove();
          else removeNative = () => listener.remove();
        })
        .catch((error) => logger.e('Billing resume listener failed', error));
    }
    return () => {
      disposed = true;
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
      void removeNative?.();
    };
  }, [userId]);

  return null;
};
