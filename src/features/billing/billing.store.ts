import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { logger } from '@/shared/logger';

import { BillingService } from './billing.service';
import { BillingPlanId, BillingState, SubscriptionSnapshot } from './billing.types';

interface BillingActions {
  initializeBilling: (userId: string | null) => Promise<void>;
  refreshBilling: (userId: string | null) => Promise<void>;
  startCheckout: (
    userId: string,
    email: string,
    planId: BillingPlanId,
    billingInterval?: 'month' | 'year'
  ) => Promise<void>;
  openCustomerPortal: (userId: string) => Promise<void>;
  startTopupCheckout: (userId: string, email: string) => Promise<void>;
  setSubscription: (subscription: SubscriptionSnapshot) => void;
  fetchInvoices: (userId: string) => Promise<void>;
  /** Lets a caller surface its own precondition failure in the same panel copy. */
  setBillingError: (message: string | null) => void;
}

const fetchSubscription = async (
  set: (partial: Partial<BillingState & BillingActions>) => void,
  userId: string | null,
  label: string
) => {
  set({
    isLoading: true,
    error: null,
    providerStatus: BillingService.getProviderStatus(),
  });
  try {
    const subscription = await BillingService.refreshSubscription(userId);
    set({ subscription, isLoading: false });
  } catch (err) {
    logger.e(`${label} failed, using local:`, err);
    const localSubscription = BillingService.getLocalSubscription();
    set({ subscription: localSubscription, isLoading: false });
  }
};

export const useBillingStore = create<BillingState & BillingActions>()(
  devtools(
    (set) => ({
      subscription: BillingService.getLocalSubscription(),
      providerStatus: BillingService.getProviderStatus(),
      isLoading: false,
      isCheckoutLoading: false,
      error: null,
      invoices: [],
      isLoadingInvoices: false,

      initializeBilling: async (userId) => fetchSubscription(set, userId, 'Billing initialization'),
      refreshBilling: async (userId) => fetchSubscription(set, userId, 'Billing refresh'),

      startCheckout: async (userId, email, planId, billingInterval = 'month') => {
        set({ isCheckoutLoading: true, error: null });
        try {
          await BillingService.startCheckout(userId, email, planId, billingInterval);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Checkout session failed.';
          set({ error: message });
          throw error;
        } finally {
          // A successful checkout navigates away, but if the redirect never
          // happens the flag must not stay set — otherwise the Upgrade button
          // is disabled forever and the click looks like it did nothing.
          set({ isCheckoutLoading: false });
        }
      },

      openCustomerPortal: async (userId) => {
        set({ isCheckoutLoading: true, error: null });
        try {
          await BillingService.openCustomerPortal(userId);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Customer portal session failed.';
          set({ error: message });
          throw error;
        } finally {
          set({ isCheckoutLoading: false });
        }
      },

      startTopupCheckout: async (userId, email) => {
        set({ isCheckoutLoading: true, error: null });
        try {
          await BillingService.startTopupCheckout(userId, email);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Top-up checkout failed.';
          set({ error: message });
          throw error;
        } finally {
          set({ isCheckoutLoading: false });
        }
      },

      setBillingError: (message) => set({ error: message }),

      setSubscription: (subscription) => {
        BillingService.persistSubscription(subscription);
        set({ subscription });
      },

      fetchInvoices: async (userId) => {
        set({ isLoadingInvoices: true });
        try {
          const invoices = await BillingService.fetchInvoices(userId);
          set({ invoices, isLoadingInvoices: false });
        } catch (err) {
          logger.e('[BILLING] Failed to fetch invoices:', err);
          set({ invoices: [], isLoadingInvoices: false });
        }
      },
    }),
    { name: 'BillingStore' }
  )
);
