import Stripe from 'stripe';

import type { DodoConfig, PlanId } from '../types.js';
import { emptySubscription, requireText } from './billing-helpers.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';
import { normalizePlanId } from './billing-plan-migration.js';
import {
  BillingProvider,
  BillingProviderName,
  WebhookProcessingResult,
} from './billing-provider.js';
import type { BillingRepository } from './billing-webhook-handlers.js';
import { createDodoBillingProvider } from './dodo-billing-provider.js';
import { ApiError } from './errors.js';
import { StripeProviderConfig, createStripeBillingProvider } from './stripe-billing-provider.js';

export type { BillingProviderName } from './billing-provider.js';

export interface BillingServiceConfig extends StripeProviderConfig {
  provider?: BillingProviderName;
  dodo?: DodoConfig;
}

interface CheckoutSessionBody {
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
  planId?: string;
  billingInterval?: 'month' | 'year';
}

interface PortalSessionBody {
  returnUrl?: string;
}

interface TopupCheckoutSessionBody {
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
}

const isValidUserId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && !value.startsWith('demo_engineer_');

const resolveSubscription = (
  sub: SubscriptionSnapshot | null,
  configured: boolean,
  hasProvider: boolean
): SubscriptionSnapshot => {
  if (!sub) return emptySubscription();
  const normalized = { ...sub, planId: normalizePlanId(sub.planId) };
  if (!configured || !hasProvider)
    return normalized.planId !== 'free' && normalized.status !== 'none'
      ? normalized
      : emptySubscription();
  return normalized.stripeCustomerId ? normalized : emptySubscription();
};

export interface InvoiceRecord {
  id: string;
  date: string;
  amount: string;
  status: string;
  invoicePdf: string | null;
}

export interface BillingService {
  readonly provider: BillingProvider | null;
  createCheckoutSession(userId: string, body: CheckoutSessionBody): Promise<{ url: string }>;
  createTopupCheckoutSession(
    userId: string,
    body: TopupCheckoutSessionBody
  ): Promise<{ url: string }>;
  createPortalSession(userId: string, body: PortalSessionBody): Promise<{ url: string }>;
  getSubscriptionStatus(userIdValue: string | null | undefined): Promise<SubscriptionSnapshot>;
  listInvoices(userId: string): Promise<InvoiceRecord[]>;
  processWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
    onEventDetected?: (step: string, eventId: string, eventType: string) => void
  ): Promise<WebhookProcessingResult>;
}

interface CreateBillingServiceOpts {
  config: BillingServiceConfig;
  stripeClient: Stripe | null;
  repository: BillingRepository;
  provider?: BillingProvider | null;
  fetchImpl?: typeof fetch;
}

export const createBillingService = ({
  config,
  stripeClient,
  repository,
  provider,
  fetchImpl = fetch,
}: CreateBillingServiceOpts): BillingService => {
  if (!repository) throw new Error('Billing repository is required.');

  const activeProvider =
    provider ??
    (config.provider === 'dodo'
      ? createDodoBillingProvider({
          config: config.dodo ?? ({ configured: false } as DodoConfig),
          repository,
          fetchImpl,
        })
      : stripeClient
        ? createStripeBillingProvider({ config, stripeClient, repository })
        : null);

  const ensureConfigured = () => {
    if (!activeProvider?.configured) {
      throw new ApiError(
        503,
        'STRIPE_NOT_CONFIGURED',
        'Billing backend is unavailable because the payment provider is not configured.'
      );
    }
  };

  const assertBillingUser = (userId: string): void => {
    requireText(userId, 'authenticated userId');
    if (userId.startsWith('demo_engineer_')) {
      throw new ApiError(
        403,
        'FORBIDDEN_DEMO_ACTION',
        'Demo profiles do not have billing privileges.'
      );
    }
  };

  return {
    provider: activeProvider,

    async createCheckoutSession(userId, body) {
      ensureConfigured();
      assertBillingUser(userId);
      const email = requireText(body?.email, 'email');
      const successUrl = requireText(body?.successUrl, 'successUrl');
      const cancelUrl = requireText(body?.cancelUrl, 'cancelUrl');
      const normalizedPlanId = normalizePlanId(body?.planId || 'junior') as PlanId;
      if (normalizedPlanId === 'free') {
        throw new ApiError(400, 'INVALID_PLAN', 'A paid plan is required for checkout.');
      }
      return activeProvider!.createCheckoutSession(userId, {
        email,
        successUrl,
        cancelUrl,
        planId: normalizedPlanId,
        billingInterval: body?.billingInterval || 'month',
      });
    },

    async createTopupCheckoutSession(userId, body) {
      ensureConfigured();
      assertBillingUser(userId);
      const email = requireText(body?.email, 'email');
      const successUrl = requireText(body?.successUrl, 'successUrl');
      const cancelUrl = requireText(body?.cancelUrl, 'cancelUrl');
      return activeProvider!.createTopupCheckoutSession(userId, {
        email,
        successUrl,
        cancelUrl,
      });
    },

    async createPortalSession(userId, body) {
      ensureConfigured();
      assertBillingUser(userId);
      const returnUrl = requireText(body?.returnUrl, 'returnUrl');
      const subscription = await repository.getSubscriptionStatus(userId);
      if (!subscription?.stripeCustomerId) {
        throw new ApiError(
          404,
          'billing_customer_not_found',
          'No Stripe customer is linked to this user.'
        );
      }
      return activeProvider!.createPortalSession(subscription.stripeCustomerId, { returnUrl });
    },

    async getSubscriptionStatus(userIdValue) {
      if (!isValidUserId(userIdValue)) return emptySubscription();
      const userId = userIdValue.trim();
      let sub: SubscriptionSnapshot | null;
      try {
        sub = await repository.getSubscriptionStatus(userId);
      } catch {
        throw new ApiError(
          503,
          'BILLING_STATUS_UNAVAILABLE',
          'Billing status is temporarily unavailable.'
        );
      }
      return resolveSubscription(sub, activeProvider?.configured === true, !!activeProvider);
    },

    async listInvoices(userId) {
      assertBillingUser(userId);
      const sub = await repository.getSubscriptionStatus(userId);
      if (!sub?.stripeCustomerId) return [];
      ensureConfigured();
      try {
        const invoices = await stripeClient!.invoices.list({
          customer: sub.stripeCustomerId,
          limit: 20,
        });
        return invoices.data.map((inv) => ({
          id: inv.id ?? 'unknown',
          date: inv.created ? new Date(inv.created * 1000).toISOString() : '',
          amount: inv.amount_paid != null ? `$${(inv.amount_paid / 100).toFixed(2)}` : '$0.00',
          status: inv.status ?? 'unknown',
          invoicePdf: inv.invoice_pdf ?? null,
        }));
      } catch {
        return [];
      }
    },

    async processWebhook(rawBody, headers, onEventDetected) {
      ensureConfigured();
      return activeProvider!.processWebhook(rawBody, headers, onEventDetected);
    },
  };
};

export const createStripeClient = (config: {
  configured: boolean;
  secretKey: string | null;
}): Stripe | null => (config.configured ? new Stripe(config.secretKey!) : null);
