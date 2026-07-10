import { storage } from '@/shared/storage';
import {
  createFreeSubscription,
  getBillingApiUrl,
  getBillingProviderStatus,
} from './billing.helpers';
import { StripeBillingProvider } from './stripe.provider';
import {
  BillingPlanId,
  BillingProviderStatus,
  SubscriptionSnapshot,
} from './billing.types';

const STORAGE_KEY = 'billing_subscription';

const getProvider = (): StripeBillingProvider | null => {
  const apiUrl = getBillingApiUrl();
  return apiUrl ? new StripeBillingProvider(apiUrl) : null;
};

const getReturnUrl = (path: string): string => {
  if (typeof window === 'undefined') {
    return path;
  }

  return `${window.location.origin}${path}`;
};

const saveSubscription = (subscription: SubscriptionSnapshot): void => {
  storage.set(STORAGE_KEY, subscription);
};

export const BillingService = {
  getProviderStatus(): BillingProviderStatus {
    return getBillingProviderStatus();
  },

  getLocalSubscription(): SubscriptionSnapshot {
    return (
      storage.get<SubscriptionSnapshot>(STORAGE_KEY) || createFreeSubscription()
    );
  },

  persistSubscription(subscription: SubscriptionSnapshot): void {
    saveSubscription(subscription);
  },

  async refreshSubscription(
    userId: string | null
  ): Promise<SubscriptionSnapshot> {
    if (!userId) {
      return this.getLocalSubscription();
    }

    const provider = getProvider();
    if (!provider) {
      return this.getLocalSubscription();
    }

    try {
      const subscription = await provider.getSubscriptionStatus(userId);
      saveSubscription(subscription);
      return subscription;
    } catch {
      return this.getLocalSubscription();
    }
  },

  async startCheckout(
    userId: string,
    email: string,
    planId: BillingPlanId
  ): Promise<void> {
    const provider = getProvider();
    if (!provider) {
      throw new Error(
        'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable Stripe Checkout.'
      );
    }

    try {
      const response = await provider.createCheckoutSession({
        userId,
        email,
        planId,
        successUrl: getReturnUrl('/profile?billing=success'),
        cancelUrl: getReturnUrl('/profile?billing=cancelled'),
      });

      window.location.assign(response.url);
    } catch {
      throw new Error(
        'Billing backend is unavailable. Please try again later or use demo mode.'
      );
    }
  },

  async openCustomerPortal(userId: string): Promise<void> {
    const provider = getProvider();
    if (!provider) {
      throw new Error(
        'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable the customer portal.'
      );
    }

    try {
      const response = await provider.createCustomerPortalSession({
        userId,
        returnUrl: getReturnUrl('/profile'),
      });

      window.location.assign(response.url);
    } catch {
      throw new Error(
        'Billing backend is unavailable. Please try again later.'
      );
    }
  },

  async startTopupCheckout(userId: string, email: string): Promise<void> {
    const provider = getProvider();
    if (!provider) {
      throw new Error(
        'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable top-up purchase.'
      );
    }

    try {
      const response = await provider.createTopupCheckoutSession({
        userId,
        email,
        successUrl: getReturnUrl('/profile?topup=success'),
        cancelUrl: getReturnUrl('/profile?topup=cancelled'),
      });

      window.location.assign(response.url);
    } catch {
      throw new Error(
        'Billing backend is unavailable. Please try again later or use demo mode.'
      );
    }
  },
};
