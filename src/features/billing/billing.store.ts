import { create } from 'zustand';
import { BillingService } from './billing.service';
import {
  BillingPlanId,
  BillingState,
  SubscriptionSnapshot,
} from './billing.types';

interface BillingActions {
  initializeBilling: (userId: string | null) => Promise<void>;
  refreshBilling: (userId: string | null) => Promise<void>;
  startCheckout: (
    userId: string,
    email: string,
    planId: BillingPlanId
  ) => Promise<void>;
  openCustomerPortal: (userId: string) => Promise<void>;
  setSubscription: (subscription: SubscriptionSnapshot) => void;
}

export const useBillingStore = create<BillingState & BillingActions>((set) => ({
  subscription: BillingService.getLocalSubscription(),
  providerStatus: BillingService.getProviderStatus(),
  isLoading: false,
  error: null,

  initializeBilling: async (userId) => {
    set({
      isLoading: true,
      error: null,
      providerStatus: BillingService.getProviderStatus(),
    });
    try {
      const subscription = await BillingService.refreshSubscription(userId);
      set({ subscription, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Billing initialization failed.';
      set({ isLoading: false, error: message });
    }
  },

  refreshBilling: async (userId) => {
    set({
      isLoading: true,
      error: null,
      providerStatus: BillingService.getProviderStatus(),
    });
    try {
      const subscription = await BillingService.refreshSubscription(userId);
      set({ subscription, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Billing refresh failed.';
      set({ isLoading: false, error: message });
    }
  },

  startCheckout: async (userId, email, planId) => {
    set({ isLoading: true, error: null });
    try {
      await BillingService.startCheckout(userId, email, planId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Checkout session failed.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  openCustomerPortal: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await BillingService.openCustomerPortal(userId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Customer portal session failed.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  setSubscription: (subscription) => {
    BillingService.persistSubscription(subscription);
    set({ subscription });
  },
}));
