import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { AppError } from '@/core/errors/app-error';

import { logger } from '@/shared/logger';

import { CLIENT_SENTENCE_CODE } from './billing.failure-copy';
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
  /**
   * Lets a caller surface its own precondition failure in the same panel copy.
   *
   * The sentence is the client's own (sign in first, demo profiles cannot buy, no
   * email on file), so it travels with `CLIENT_SENTENCE_CODE`: a sentence that keeps
   * its wording has to be classified like any other, or the resolver would be unable
   * to tell it apart from a failure that simply lost its code.
   *
   * `null` clears the failure; because the store owns both fields, that is also how
   * a sign-out drops a stale code instead of leaving it behind a cleared message.
   */
  setBillingError: (message: string | null) => void;
}

/** The failure the billing panel shows: the sentence, and the code its copy comes from. */
interface BillingFailure {
  message: string;
  code: string | null;
}

type BillingSet = (partial: Partial<BillingState & BillingActions>) => void;

/** Reads a thrown value into the pair the panel needs, keeping whatever code it carried. */
const toBillingFailure = (error: unknown, fallbackMessage: string): BillingFailure => ({
  message: error instanceof Error ? error.message : fallbackMessage,
  code: error instanceof AppError ? (error.apiCode ?? null) : null,
});

/**
 * The only writer of `error` and `errorCode`.
 *
 * The panel reads the two together — it picks its copy from the code, not from the
 * sentence — so writing one without the other lets a later failure be explained by
 * the previous failure's code. That is what happened: a portal request that failed
 * while offline was rendered with the audit code left behind by an earlier
 * checkout attempt. A `null` failure clears both.
 */
const setBillingFailure = (
  set: BillingSet,
  failure: BillingFailure | null,
  rest: Partial<BillingState & BillingActions> = {}
): void => {
  set({ ...rest, error: failure?.message ?? null, errorCode: failure?.code ?? null });
};

const fetchSubscription = async (set: BillingSet, userId: string | null, label: string) => {
  setBillingFailure(set, null, {
    isLoading: true,
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
      errorCode: null,
      invoices: [],
      isLoadingInvoices: false,

      initializeBilling: async (userId) => fetchSubscription(set, userId, 'Billing initialization'),
      refreshBilling: async (userId) => fetchSubscription(set, userId, 'Billing refresh'),

      startCheckout: async (userId, email, planId, billingInterval = 'month') => {
        setBillingFailure(set, null, { isCheckoutLoading: true });
        try {
          await BillingService.startCheckout(userId, email, planId, billingInterval);
        } catch (error) {
          setBillingFailure(set, toBillingFailure(error, 'Checkout session failed.'));
          throw error;
        } finally {
          // A successful checkout navigates away, but if the redirect never
          // happens the flag must not stay set — otherwise the Upgrade button
          // is disabled forever and the click looks like it did nothing.
          set({ isCheckoutLoading: false });
        }
      },

      openCustomerPortal: async (userId) => {
        setBillingFailure(set, null, { isCheckoutLoading: true });
        try {
          await BillingService.openCustomerPortal(userId);
        } catch (error) {
          setBillingFailure(set, toBillingFailure(error, 'Customer portal session failed.'));
          throw error;
        } finally {
          set({ isCheckoutLoading: false });
        }
      },

      startTopupCheckout: async (userId, email) => {
        setBillingFailure(set, null, { isCheckoutLoading: true });
        try {
          await BillingService.startTopupCheckout(userId, email);
        } catch (error) {
          setBillingFailure(set, toBillingFailure(error, 'Top-up checkout failed.'));
          throw error;
        } finally {
          set({ isCheckoutLoading: false });
        }
      },

      setBillingError: (message) =>
        setBillingFailure(set, message ? { message, code: CLIENT_SENTENCE_CODE } : null),

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
