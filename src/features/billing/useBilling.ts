import { useCallback } from 'react';
import { useBillingStore } from './index';
import { useAuthStore } from '@/features/auth';

export const useBilling = () => {
  const { currentUser } = useAuthStore();
  const {
    subscription,
    providerStatus,
    isLoading,
    error,
    refreshBilling,
    startCheckout,
    openCustomerPortal,
  } = useBillingStore();

  const userId = currentUser?.id;
  const email = currentUser?.email;

  const upgrade = useCallback(() => {
    if (!userId || !email) return Promise.resolve();
    return startCheckout(userId, email, 'pro');
  }, [userId, email, startCheckout]);

  const manageSubscription = useCallback(() => {
    if (!userId) return Promise.resolve();
    return openCustomerPortal(userId);
  }, [userId, openCustomerPortal]);

  const refresh = useCallback(() => {
    if (!userId) return Promise.resolve();
    return refreshBilling(userId);
  }, [userId, refreshBilling]);

  return {
    subscription,
    providerStatus,
    isLoading,
    error,
    upgrade,
    manageSubscription,
    refresh,
  };
};
