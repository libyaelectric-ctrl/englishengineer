import { storage } from '@/shared/storage';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
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
  storage.globalSet(STORAGE_KEY, subscription);
};

export const BillingService = {
  getProviderStatus(): BillingProviderStatus {
    return getBillingProviderStatus();
  },

  getLocalSubscription(): SubscriptionSnapshot {
    return (
      storage.globalGet<SubscriptionSnapshot>(STORAGE_KEY) ||
      createFreeSubscription()
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
      throw new AppError({
        code: ErrorCode.NETWORK,
        message: 'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable Stripe Checkout.',
      });
    }

    try {
      const response = await provider.createCheckoutSession({
        userId,
        email,
        planId,
        successUrl: getReturnUrl('/billing?billing=success'),
        cancelUrl: getReturnUrl('/billing?billing=cancelled'),
      });

      window.location.assign(response.url);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new AppError({ code: ErrorCode.NETWORK, message: 'Billing service is temporarily unavailable.' });
    }
  },

  async openCustomerPortal(userId: string): Promise<void> {
    const provider = getProvider();
    if (!provider) {
      throw new AppError({
        code: ErrorCode.NETWORK,
        message: 'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable the customer portal.',
      });
    }

    try {
      const response = await provider.createCustomerPortalSession({
        userId,
        returnUrl: getReturnUrl('/billing'),
      });

      window.location.assign(response.url);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new AppError({ code: ErrorCode.NETWORK, message: 'Billing service is temporarily unavailable.' });
    }
  },

  async startTopupCheckout(userId: string, email: string): Promise<void> {
    const provider = getProvider();
    if (!provider) {
      throw new AppError({
        code: ErrorCode.NETWORK,
        message: 'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable top-up purchase.',
      });
    }

    try {
      const response = await provider.createTopupCheckoutSession({
        userId,
        email,
        successUrl: getReturnUrl('/billing?topup=success'),
        cancelUrl: getReturnUrl('/billing?topup=cancelled'),
      });

      window.location.assign(response.url);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new AppError({ code: ErrorCode.NETWORK, message: 'Billing service is temporarily unavailable.' });
    }
  },
};
