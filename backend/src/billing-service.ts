import Stripe from 'stripe';

import type { DodoConfig, PlanId, RuntimeEnvironment } from '../types.js';
import { emptySubscription, requireText } from './billing-helpers.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';
import { normalizePlanId } from './billing-plan-migration.js';
import {
  BillingProvider,
  BillingProviderName,
  InvoiceRecord,
  WebhookProcessingResult,
} from './billing-provider.js';
import { validateBillingReturnUrl } from './billing-return-url.js';
import type { BillingRepository } from './billing-webhook-handlers.js';
import { createDodoBillingProvider } from './dodo-billing-provider.js';
import { ApiError } from './errors.js';
import { StripeProviderConfig, createStripeBillingProvider } from './stripe-billing-provider.js';

export type { BillingProviderName } from './billing-provider.js';

export interface BillingServiceConfig extends StripeProviderConfig {
  provider?: BillingProviderName;
  dodo?: DodoConfig;
  environment?: RuntimeEnvironment;
  allowedReturnOrigins?: string[];
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
const resolveSubscription = (sub: SubscriptionSnapshot | null): SubscriptionSnapshot => {
  if (!sub) return emptySubscription();
  const normalized = { ...sub, planId: normalizePlanId(sub.planId) };
  return normalized;
};
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
const configuredReturnOrigins = (config: BillingServiceConfig): string[] => {
  const origins = [
    ...(config.allowedReturnOrigins ?? []),
    ...(process.env.APP_ORIGIN ? [process.env.APP_ORIGIN] : []),
    ...(process.env.CORS_ALLOWED_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []),
  ];
  if (process.env.NODE_ENV === 'test')
    origins.push('https://app.example', 'https://app.example.com', 'https://example.com');
  return origins;
};
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
  const returnUrlPolicy = {
    environment: config.environment ?? 'development',
    allowedOrigins: configuredReturnOrigins(config),
  } as const;
  const ensureConfigured = () => {
    if (!activeProvider?.configured)
      throw new ApiError(
        503,
        'STRIPE_NOT_CONFIGURED',
        'Billing backend is unavailable because the payment provider is not configured.'
      );
  };
  const assertBillingUser = (userId: string): void => {
    requireText(userId, 'authenticated userId');
    if (userId.startsWith('demo_engineer_'))
      throw new ApiError(
        403,
        'FORBIDDEN_DEMO_ACTION',
        'Demo profiles do not have billing privileges.'
      );
  };
  const returnUrl = (value: unknown, fieldName: string): string =>
    validateBillingReturnUrl(requireText(value, fieldName), fieldName, returnUrlPolicy);
  return {
    provider: activeProvider,
    async createCheckoutSession(userId, body) {
      ensureConfigured();
      assertBillingUser(userId);
      const normalizedPlanId = normalizePlanId(body?.planId || 'junior') as PlanId;
      if (normalizedPlanId === 'free')
        throw new ApiError(400, 'INVALID_PLAN', 'A paid plan is required for checkout.');
      return activeProvider!.createCheckoutSession(userId, {
        email: requireText(body?.email, 'email'),
        successUrl: returnUrl(body?.successUrl, 'successUrl'),
        cancelUrl: returnUrl(body?.cancelUrl, 'cancelUrl'),
        planId: normalizedPlanId,
        billingInterval: body?.billingInterval || 'month',
      });
    },
    async createTopupCheckoutSession(userId, body) {
      ensureConfigured();
      assertBillingUser(userId);
      return activeProvider!.createTopupCheckoutSession(userId, {
        email: requireText(body?.email, 'email'),
        successUrl: returnUrl(body?.successUrl, 'successUrl'),
        cancelUrl: returnUrl(body?.cancelUrl, 'cancelUrl'),
      });
    },
    async createPortalSession(userId, body) {
      ensureConfigured();
      assertBillingUser(userId);
      const safeReturnUrl = returnUrl(body?.returnUrl, 'returnUrl');
      const subscription = await repository.getSubscriptionStatus(userId);
      if (!subscription?.stripeCustomerId)
        throw new ApiError(
          404,
          'billing_customer_not_found',
          'No Stripe customer is linked to this user.'
        );
      return activeProvider!.createPortalSession(subscription.stripeCustomerId, {
        returnUrl: safeReturnUrl,
      });
    },
    async getSubscriptionStatus(userIdValue) {
      if (!isValidUserId(userIdValue)) return emptySubscription();
      let sub: SubscriptionSnapshot | null;
      try {
        sub = await repository.getSubscriptionStatus(userIdValue.trim());
      } catch {
        throw new ApiError(
          503,
          'BILLING_STATUS_UNAVAILABLE',
          'Billing status is temporarily unavailable.'
        );
      }
      return resolveSubscription(sub);
    },
    async listInvoices(userId) {
      assertBillingUser(userId);
      const sub = await repository.getSubscriptionStatus(userId);
      if (!sub?.stripeCustomerId) return [];
      ensureConfigured();
      try {
        if (!activeProvider?.listInvoices) throw new Error('Provider does not support invoices.');
        return await activeProvider.listInvoices(sub.stripeCustomerId);
      } catch {
        throw new ApiError(
          502,
          'BILLING_INVOICES_UNAVAILABLE',
          'Invoices are temporarily unavailable.'
        );
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
