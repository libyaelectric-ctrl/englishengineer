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

    const subscription = await provider.getSubscriptionStatus(userId);
    saveSubscription(subscription);
    return subscription;
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

    const response = await provider.createCheckoutSession({
      userId,
      email,
      planId,
      successUrl: getReturnUrl('/profile?billing=success'),
      cancelUrl: getReturnUrl('/profile?billing=cancelled'),
    });

    window.location.assign(response.url);
  },

  async openCustomerPortal(userId: string): Promise<void> {
    const provider = getProvider();
    if (!provider) {
      throw new Error(
        'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable the customer portal.'
      );
    }

    const response = await provider.createCustomerPortalSession({
      userId,
      returnUrl: getReturnUrl('/profile'),
    });

    window.location.assign(response.url);
  },
};
