import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';

import { logger } from '@/shared/logger';
import { storage } from '@/shared/storage';

import {
  createFreeSubscription,
  getBillingApiUrl,
  getBillingProviderStatus,
} from './billing.helpers';
import {
  BillingPlanId,
  BillingProviderStatus,
  InvoiceRecord,
  SubscriptionSnapshot,
} from './billing.types';
import { StripeBillingProvider } from './stripe.provider';

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

const ALLOWED_REDIRECT_HOSTS = [
  'checkout.stripe.com',
  'billing.stripe.com',
  'portal.stripe.com',
  // Dodo Payments (merchant of record)
  'checkout.dodopayments.com',
  'test.checkout.dodopayments.com',
  'customer.dodopayments.com',
  'test.customer.dodopayments.com',
];

const safeRedirect = (url: string): void => {
  try {
    const parsed = new URL(url);
    if (ALLOWED_REDIRECT_HOSTS.some((host) => parsed.hostname === host)) {
      window.location.assign(url);
    } else {
      logger.w('[BILLING] Blocked redirect to untrusted host:', parsed.hostname);
    }
  } catch {
    logger.w('[BILLING] Invalid redirect URL:', url);
  }
};

const saveSubscription = (subscription: SubscriptionSnapshot): void => {
  storage.globalSet(STORAGE_KEY, subscription);
};

export const BillingService = {
  getProviderStatus(): BillingProviderStatus {
    return getBillingProviderStatus();
  },

  getLocalSubscription(): SubscriptionSnapshot {
    return storage.globalGet<SubscriptionSnapshot>(STORAGE_KEY) || createFreeSubscription();
  },

  persistSubscription(subscription: SubscriptionSnapshot): void {
    saveSubscription(subscription);
  },

  async refreshSubscription(userId: string | null): Promise<SubscriptionSnapshot> {
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
    } catch (e) {
      logger.w('[BILLING] Failed to fetch subscription from provider, falling back to local', e);
      return this.getLocalSubscription();
    }
  },

  async startCheckout(
    userId: string,
    email: string,
    planId: BillingPlanId,
    billingInterval: 'month' | 'year' = 'month'
  ): Promise<void> {
    const provider = getProvider();
    if (!provider) {
      throw new AppError({
        code: ErrorCode.NETWORK,
        message:
          'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable Stripe Checkout.',
      });
    }

    try {
      const response = await provider.createCheckoutSession({
        userId,
        email,
        planId,
        successUrl: getReturnUrl('/billing?billing=success'),
        cancelUrl: getReturnUrl('/billing?billing=cancelled'),
        billingInterval,
      });

      safeRedirect(response.url);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new AppError({
        code: ErrorCode.NETWORK,
        message: 'Billing service is temporarily unavailable.',
      });
    }
  },

  async openCustomerPortal(userId: string): Promise<void> {
    const provider = getProvider();
    if (!provider) {
      throw new AppError({
        code: ErrorCode.NETWORK,
        message:
          'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable the customer portal.',
      });
    }

    try {
      const response = await provider.createCustomerPortalSession({
        userId,
        returnUrl: getReturnUrl('/billing'),
      });

      safeRedirect(response.url);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new AppError({
        code: ErrorCode.NETWORK,
        message: 'Billing service is temporarily unavailable.',
      });
    }
  },

  async startTopupCheckout(userId: string, email: string): Promise<void> {
    const provider = getProvider();
    if (!provider) {
      throw new AppError({
        code: ErrorCode.NETWORK,
        message:
          'Billing backend is not connected. Configure VITE_BILLING_API_URL to enable top-up purchase.',
      });
    }

    try {
      const response = await provider.createTopupCheckoutSession({
        userId,
        email,
        successUrl: getReturnUrl('/billing?topup=success'),
        cancelUrl: getReturnUrl('/billing?topup=cancelled'),
      });

      safeRedirect(response.url);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new AppError({
        code: ErrorCode.NETWORK,
        message: 'Billing service is temporarily unavailable.',
      });
    }
  },

  async fetchInvoices(userId: string): Promise<InvoiceRecord[]> {
    const provider = getProvider();
    if (!provider) return [];
    try {
      return await provider.getInvoices(userId);
    } catch {
      return [];
    }
  },
};
