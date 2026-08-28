/**
 * Stripe Billing Provider (Legacy Fallback)
 *
 * This file is retained as a fallback billing provider. The primary billing
 * provider is now DodoPayments (see dodo-billing-provider.ts). This Stripe
 * provider is only activated when BILLING_PROVIDER=stripe in the environment
 * configuration. It is NOT used in the current production deployment.
 *
 * Safe to remove once Stripe is fully decommissioned.
 */
import Stripe from 'stripe';

import { requireText } from './billing-helpers.js';
import { normalizePlanId } from './billing-plan-migration.js';
import {
  BillingCheckoutBody,
  BillingPortalBody,
  BillingProvider,
  BillingTopupBody,
  NormalizedWebhookEvent,
  WebhookProcessingResult,
  processNormalizedWebhookEvent,
} from './billing-provider.js';
import type { BillingRepository } from './billing-webhook-handlers.js';
import { ApiError } from './errors.js';
import { logger } from './logger.js';
import { stripeRetry } from './utils/retry.js';

export interface StripeProviderConfig {
  configured: boolean;
  webhookSecret: string | null;
  [key: string]: unknown;
}

interface PlanMeta {
  unitAmount: number;
  nickname: string;
  productName: string;
}

const PLAN_META: Record<string, PlanMeta> = {
  junior: {
    unitAmount: 2900,
    nickname: 'Junior Monthly',
    productName: 'EngVox Junior',
  },
  senior: {
    unitAmount: 5900,
    nickname: 'Senior Monthly',
    productName: 'EngVox Senior',
  },
  specialist: {
    unitAmount: 7900,
    nickname: 'Specialist Monthly',
    productName: 'EngVox Specialist',
  },
  master: {
    unitAmount: 9900,
    nickname: 'Master Monthly',
    productName: 'EngVox Master',
  },
  team: {
    unitAmount: 99900,
    nickname: 'Team Monthly',
    productName: 'EngVox Team',
  },
};

const PLAN_PRICE_CONFIG: Record<string, string> = {
  junior: 'priceJuniorMonthly',
  senior: 'priceSeniorMonthly',
  specialist: 'priceSpecialistMonthly',
  master: 'priceMasterMonthly',
  team: 'priceTeamMonthly',
};

const resolveOrProvisionPriceId = async (
  config: StripeProviderConfig,
  stripeClient: Stripe,
  planId: Exclude<import('../types.js').PlanId, 'free'>,
  billingInterval: 'month' | 'year' = 'month'
): Promise<string> => {
  const monthlyKey = PLAN_PRICE_CONFIG[planId];
  const configKey =
    billingInterval === 'year' ? monthlyKey.replace('Monthly', 'Annual') : monthlyKey;
  if (configKey && config[configKey]) {
    return config[configKey] as string;
  }

  const meta = PLAN_META[planId];
  if (!meta) {
    throw new ApiError(400, 'INVALID_PLAN', `Unknown plan: "${planId}".`);
  }

  const existingPrices = await stripeRetry(() =>
    stripeClient.prices.list({
      active: true,
      type: 'recurring',
      limit: 100,
    })
  );

  const annualAmount = Math.round(meta.unitAmount * 12 * 0.8);
  const intervalAmount = billingInterval === 'year' ? annualAmount : meta.unitAmount;
  const intervalNickname = billingInterval === 'year' ? `${planId} annual 20% off` : meta.nickname;
  const found = existingPrices.data.find(
    (p) =>
      p.nickname === intervalNickname &&
      p.recurring?.interval === billingInterval &&
      p.unit_amount === intervalAmount &&
      p.currency === 'usd'
  );

  if (found) {
    return found.id;
  }

  let product;
  const existingProducts = await stripeClient.products.list({
    active: true,
    limit: 100,
  });
  product = existingProducts.data.find((p) => p.name === meta.productName);
  if (!product) {
    product = await stripeClient.products.create({
      name: meta.productName,
      metadata: { engineeros_plan: planId },
    });
  }

  const newPrice = await stripeClient.prices.create({
    unit_amount: intervalAmount,
    currency: 'usd',
    recurring: { interval: billingInterval },
    product: product.id,
    nickname: intervalNickname,
    metadata: { engineeros_plan: planId, billing_interval: billingInterval },
  });

  return newPrice.id;
};

const resolveOrProvisionTopupPriceId = async (stripeClient: Stripe): Promise<string> => {
  const nickname = 'AI Coach Top-up 50 Credits';
  const existingPrices = await stripeClient.prices.list({
    active: true,
    type: 'one_time',
    limit: 100,
  });
  const found = existingPrices.data.find(
    (p) => p.nickname === nickname && p.unit_amount === 500 && p.currency === 'usd'
  );
  if (found) {
    return found.id;
  }

  const existingProducts = await stripeClient.products.list({
    active: true,
    limit: 100,
  });
  let product = existingProducts.data.find((p) => p.name === 'AI Coach Top-up');
  if (!product) {
    product = await stripeClient.products.create({
      name: 'AI Coach Top-up',
      metadata: { type: 'topup' },
    });
  }

  const newPrice = await stripeClient.prices.create({
    unit_amount: 500,
    currency: 'usd',
    product: product.id,
    nickname: nickname,
    metadata: { type: 'topup' },
  });
  return newPrice.id;
};

const verifyStripeSignature = (
  stripeClient: Stripe,
  rawBody: Buffer,
  signature: string | undefined,
  webhookSecret: string
): Stripe.Event => {
  try {
    return stripeClient.webhooks.constructEvent(
      rawBody,
      requireText(signature, 'Stripe-Signature'),
      webhookSecret
    );
  } catch (err: unknown) {
    logger.error(
      'Stripe webhook error',
      {
        eventId: 'unknown',
        type: 'unknown',
        step: 'signature_verification',
        errorName: err instanceof Error ? err.name : 'unknown',
        errorMessage: 'Stripe webhook signature verification failed.',
        supabaseCode: 'N/A',
        supabaseDetails: 'N/A',
      },
      err instanceof Error ? err : undefined
    );
    throw new ApiError(
      400,
      'invalid_webhook_signature',
      'Stripe webhook signature verification failed.'
    );
  }
};

const getHeader = (
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined => {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : undefined;
};

const normalizeStripeEvent = (event: Stripe.Event): NormalizedWebhookEvent => ({
  id: event.id,
  type: event.type,
  data: (event.data?.object ?? {}) as unknown as Record<string, unknown>,
});

interface CreateStripeBillingProviderOpts {
  config: StripeProviderConfig;
  stripeClient: Stripe;
  repository: BillingRepository;
}

export const createStripeBillingProvider = ({
  config,
  stripeClient,
  repository,
}: CreateStripeBillingProviderOpts): BillingProvider => {
  const ensureConfigured = () => {
    if (!config.configured) {
      throw new ApiError(
        503,
        'STRIPE_NOT_CONFIGURED',
        'Billing backend is unavailable because Stripe is not configured.'
      );
    }
  };

  return {
    name: 'stripe',
    configured: config.configured === true && !!stripeClient,
    webhookRoutes: [{ path: '/api/webhooks/stripe', signatureHeaders: ['stripe-signature'] }],

    async createCheckoutSession(userId, body: BillingCheckoutBody) {
      ensureConfigured();
      const planId = normalizePlanId(body.planId) as Exclude<import('../types.js').PlanId, 'free'>;
      const billingInterval = body.billingInterval || 'month';

      const price = await resolveOrProvisionPriceId(config, stripeClient, planId, billingInterval);

      const session = await stripeClient.checkout.sessions.create({
        mode: 'subscription',
        customer_email: body.email,
        line_items: [{ price, quantity: 1 }],
        success_url: body.successUrl,
        cancel_url: body.cancelUrl,
        client_reference_id: userId,
        metadata: { userId, planId },
        // IMPORTANT: Stripe does NOT copy Checkout Session metadata onto the
        // Subscription object it creates. Without this, every later webhook
        // whose payload is the Subscription itself (customer.subscription.
        // created/updated/deleted) or an Invoice for it has no way to resolve
        // which app user it belongs to, so those events are silently dropped.
        subscription_data: {
          metadata: { userId, planId },
        },
      });
      if (!session.url) {
        throw new ApiError(502, 'stripe_invalid_response', 'Stripe did not return a checkout URL.');
      }
      return { url: session.url };
    },

    async createTopupCheckoutSession(userId, body: BillingTopupBody) {
      ensureConfigured();
      const price = await resolveOrProvisionTopupPriceId(stripeClient);

      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        customer_email: body.email,
        line_items: [{ price, quantity: 1 }],
        success_url: body.successUrl,
        cancel_url: body.cancelUrl,
        client_reference_id: userId,
        metadata: { userId, type: 'topup', credits: '50' },
      });
      if (!session.url) {
        throw new ApiError(502, 'stripe_invalid_response', 'Stripe did not return a checkout URL.');
      }
      return { url: session.url };
    },

    async createPortalSession(customerId, body: BillingPortalBody) {
      ensureConfigured();
      const session = await stripeClient.billingPortal.sessions.create({
        customer: customerId,
        return_url: body.returnUrl,
      });
      return { url: session.url };
    },

    async processWebhook(rawBody, headers, onEventDetected): Promise<WebhookProcessingResult> {
      ensureConfigured();
      if (!config.webhookSecret)
        throw new ApiError(
          503,
          'stripe_webhook_not_configured',
          'Stripe webhook verification is not configured.'
        );

      const signature = getHeader(headers, 'stripe-signature');
      const event = verifyStripeSignature(stripeClient, rawBody, signature, config.webhookSecret);
      if (typeof onEventDetected === 'function')
        onEventDetected('signature_verification', event.id, event.type);

      try {
        return await processNormalizedWebhookEvent(repository, normalizeStripeEvent(event));
      } catch (err: unknown) {
        const e = err as Record<string, unknown>;
        logger.error(
          'Stripe webhook error',
          {
            eventId: event.id,
            type: event.type,
            step: 'dispatch',
            errorName: e.name,
            errorMessage: e.message || 'Unknown error',
            supabaseCode: e.code || 'N/A',
            supabaseDetails: e.details || 'N/A',
          },
          err instanceof Error ? err : undefined
        );
        throw err;
      }
    },
  };
};
