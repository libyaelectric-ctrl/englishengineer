import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
import { logger } from '@/shared/logger';
import { storage } from '@/shared/storage';
import { isNativePlatform } from '@/shared/utils/capacitor';
import { createFreeSubscription, getBillingApiUrl, getBillingProviderStatus } from './billing.helpers';
import type { BillingPlanId, BillingProviderStatus, InvoiceRecord, SubscriptionSnapshot } from './billing.types';
import { StripeBillingProvider } from './stripe.provider';
const STORAGE_KEY = 'billing_subscription';
const getProvider = (): StripeBillingProvider | null => { const url = getBillingApiUrl(); return url ? new StripeBillingProvider(url) : null; };
const returnUrl = (path: string): string => typeof window === 'undefined' ? path : `${window.location.origin}${path}`;
const ALLOWED_HOSTS = ['checkout.stripe.com', 'billing.stripe.com', 'portal.stripe.com', 'checkout.dodopayments.com', 'test.checkout.dodopayments.com', 'customer.dodopayments.com', 'test.customer.dodopayments.com'];
const safeRedirect = async (url: string): Promise<void> => { try { const parsed = new URL(url); if (!ALLOWED_HOSTS.includes(parsed.hostname) && !parsed.hostname.endsWith('.dodopayments.com')) { logger.w('[BILLING] Blocked untrusted redirect host:', parsed.hostname); return; } if (isNativePlatform()) { const { openExternalUrl } = await import('@/shared/utils/capacitor'); await openExternalUrl(url); } else window.location.assign(url); } catch { logger.w('[BILLING] Invalid redirect URL.'); } };
const save = (subscription: SubscriptionSnapshot): void => { storage.set(STORAGE_KEY, subscription); };
const providerRequired = (): StripeBillingProvider => { const provider = getProvider(); if (!provider) throw new AppError({ code: ErrorCode.NETWORK, message: 'Billing backend is not connected.' }); return provider; };
export const BillingService = {
  getProviderStatus(): BillingProviderStatus { return getBillingProviderStatus(); },
  getLocalSubscription(): SubscriptionSnapshot { return storage.get<SubscriptionSnapshot>(STORAGE_KEY) || createFreeSubscription(); },
  persistSubscription(subscription: SubscriptionSnapshot): void { save(subscription); },
  async refreshSubscription(userId: string | null): Promise<SubscriptionSnapshot> { if (!userId) return createFreeSubscription(); const provider = getProvider(); if (!provider) return this.getLocalSubscription(); try { const subscription = await provider.getSubscriptionStatus(userId); save(subscription); return subscription; } catch (error) { logger.w('[BILLING] Provider refresh failed; using current user cache.', error); return this.getLocalSubscription(); } },
  async startCheckout(userId: string, email: string, planId: BillingPlanId, billingInterval: 'month' | 'year' = 'month'): Promise<void> { const response = await providerRequired().createCheckoutSession({ userId, email, planId, successUrl: returnUrl('/billing?billing=success'), cancelUrl: returnUrl('/billing?billing=cancelled'), billingInterval }); await safeRedirect(response.url); },
  async openCustomerPortal(userId: string): Promise<void> { const response = await providerRequired().createCustomerPortalSession({ userId, returnUrl: returnUrl('/billing') }); await safeRedirect(response.url); },
  async startTopupCheckout(userId: string, email: string): Promise<void> { const response = await providerRequired().createTopupCheckoutSession({ userId, email, successUrl: returnUrl('/billing?topup=success'), cancelUrl: returnUrl('/billing?topup=cancelled') }); await safeRedirect(response.url); },
  async fetchInvoices(userId: string): Promise<InvoiceRecord[]> { const provider = getProvider(); if (!provider) return []; try { return await provider.getInvoices(userId); } catch { return []; } },
};
