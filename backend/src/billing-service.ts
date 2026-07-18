import Stripe from 'stripe';
import { logger } from './logger.js';
import { ApiError } from './errors.js';
import { requireText, emptySubscription } from './billing-helpers.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';
import { stripeRetry } from './utils/retry.js';
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handlePaymentFailed,
  handleSubscriptionDeleted,
} from './billing-webhook-handlers.js';
import type { BillingRepository } from './billing-webhook-handlers.js';

const dispatchWebhookEvent = async (
  repository: BillingRepository,
  eventType: string,
  object: Record<string, unknown>
) => {
  if (eventType === 'checkout.session.completed') {
    await handleCheckoutCompleted(repository, object);
  } else if (
    eventType === 'customer.subscription.created' ||
    eventType === 'customer.subscription.updated'
  ) {
    await handleSubscriptionUpdated(repository, object);
  } else if (eventType === 'invoice.payment_failed') {
    await handlePaymentFailed(repository, object);
  } else if (eventType === 'customer.subscription.deleted') {
    await handleSubscriptionDeleted(repository, object);
  }
};

interface PlanMeta {
  unitAmount: number;
  nickname: string;
  productName: string;
}

const PLAN_META: Record<string, PlanMeta> = {
  pro: {
    unitAmount: 1900,
    nickname: 'Pro Monthly',
    productName: 'EngineerOS Pro',
  },
  project: {
    unitAmount: 3900,
    nickname: 'Project Monthly',
    productName: 'EngineerOS Project',
  },
  max: {
    unitAmount: 5900,
    nickname: 'Max Monthly',
    productName: 'EngineerOS Max',
  },
  exec: {
    unitAmount: 9900,
    nickname: 'Exec Monthly',
    productName: 'EngineerOS Exec',
  },
  private: {
    unitAmount: 99900,
    nickname: 'Private Monthly',
    productName: 'EngineerOS Private',
  },
  team: {
    unitAmount: 1900,
    nickname: 'Team Monthly',
    productName: 'EngineerOS Team',
  },
};

const PLAN_PRICE_CONFIG: Record<string, string> = {
  pro: 'priceProMonthly',
  project: 'priceProjectMonthly',
  max: 'priceMaxMonthly',
  exec: 'priceExecMonthly',
  private: 'pricePrivateMonthly',
  team: 'priceTeamMonthly',
};

const resolveOrProvisionPriceId = async (
  config: BillingServiceConfig,
  stripeClient: Stripe,
  planId: string
): Promise<string> => {
  const configKey = PLAN_PRICE_CONFIG[planId];
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

  const found = existingPrices.data.find(
    (p) =>
      p.nickname === meta.nickname &&
      p.recurring?.interval === 'month' &&
      p.unit_amount === meta.unitAmount &&
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
    unit_amount: meta.unitAmount,
    currency: 'usd',
    recurring: { interval: 'month' },
    product: product.id,
    nickname: meta.nickname,
    metadata: { engineeros_plan: planId },
  });

  return newPrice.id;
};

const resolveOrProvisionTopupPriceId = async (
  stripeClient: Stripe
): Promise<string> => {
  const nickname = 'AI Coach Top-up 50 Credits';
  const existingPrices = await stripeClient.prices.list({
    active: true,
    type: 'one_time',
    limit: 100,
  });
  const found = existingPrices.data.find(
    (p) =>
      p.nickname === nickname && p.unit_amount === 500 && p.currency === 'usd'
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

export interface BillingServiceConfig {
  configured: boolean;
  webhookSecret: string | null;
  [key: string]: string | boolean | null | undefined;
}

interface CheckoutSessionBody {
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
  planId?: string;
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
  typeof value === 'string' &&
  value.trim().length > 0 &&
  !value.startsWith('demo_engineer_');

const resolveSubscription = (
  sub: SubscriptionSnapshot | null,
  configured: boolean,
  hasStripe: boolean
): SubscriptionSnapshot => {
  if (!sub) return emptySubscription();
  if (!configured || !hasStripe)
    return sub.planId !== 'free' && sub.status !== 'none'
      ? sub
      : emptySubscription();
  return sub.stripeCustomerId ? sub : emptySubscription();
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

const processWebhookEvent = async (
  repository: BillingRepository,
  event: Stripe.Event
) => {
  const eventId = event.id;
  if (await repository.hasStripeEventBeenProcessed(eventId))
    return { received: true, duplicate: true, eventId };
  await dispatchWebhookEvent(
    repository,
    event.type,
    (event.data?.object ?? {}) as unknown as Record<string, unknown>
  );
  await repository.markStripeEventProcessed(eventId, {
    type: event.type,
    processedAt: new Date().toISOString(),
  });
  return { received: true, duplicate: false, eventId };
};

export interface BillingService {
  createCheckoutSession(
    userId: string,
    body: CheckoutSessionBody
  ): Promise<{ url: string }>;
  createTopupCheckoutSession(
    userId: string,
    body: TopupCheckoutSessionBody
  ): Promise<{ url: string }>;
  createPortalSession(
    userId: string,
    body: PortalSessionBody
  ): Promise<{ url: string }>;
  getSubscriptionStatus(
    userIdValue: string | null | undefined
  ): Promise<SubscriptionSnapshot>;
  processWebhook(
    rawBody: Buffer,
    signature: string | undefined,
    onEventDetected?: (step: string, eventId: string, eventType: string) => void
  ): Promise<{ received: boolean; duplicate: boolean; eventId: string }>;
}

interface CreateBillingServiceOpts {
  config: BillingServiceConfig;
  stripeClient: Stripe | null;
  repository: BillingRepository;
}

export const createBillingService = ({
  config,
  stripeClient,
  repository,
}: CreateBillingServiceOpts): BillingService => {
  if (!repository) throw new Error('Billing repository is required.');
  const ensureConfigured = () => {
    if (!config.configured || !stripeClient) {
      throw new ApiError(
        503,
        'STRIPE_NOT_CONFIGURED',
        'Billing backend is unavailable because Stripe is not configured.'
      );
    }
  };

  return {
    async createCheckoutSession(userId, body) {
      ensureConfigured();
      requireText(userId, 'authenticated userId');
      if (userId.startsWith('demo_engineer_')) {
        throw new ApiError(
          403,
          'FORBIDDEN_DEMO_ACTION',
          'Demo profiles do not have billing privileges.'
        );
      }
      const email = requireText(body?.email, 'email');
      const successUrl = requireText(body?.successUrl, 'successUrl');
      const cancelUrl = requireText(body?.cancelUrl, 'cancelUrl');
      const planId = body?.planId || 'pro';

      const price = await resolveOrProvisionPriceId(
        config,
        stripeClient!,
        planId
      );

      const session = await stripeClient!.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email,
        line_items: [{ price, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: { userId, planId },
      });
      if (!session.url) {
        throw new ApiError(
          502,
          'stripe_invalid_response',
          'Stripe did not return a checkout URL.'
        );
      }
      return { url: session.url };
    },

    async createTopupCheckoutSession(userId, body) {
      ensureConfigured();
      requireText(userId, 'authenticated userId');
      if (userId.startsWith('demo_engineer_')) {
        throw new ApiError(
          403,
          'FORBIDDEN_DEMO_ACTION',
          'Demo profiles do not have billing privileges.'
        );
      }
      const email = requireText(body?.email, 'email');
      const successUrl = requireText(body?.successUrl, 'successUrl');
      const cancelUrl = requireText(body?.cancelUrl, 'cancelUrl');

      const price = await resolveOrProvisionTopupPriceId(stripeClient!);

      const session = await stripeClient!.checkout.sessions.create({
        mode: 'payment',
        customer_email: email,
        line_items: [{ price, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: { userId, type: 'topup', credits: '50' },
      });
      if (!session.url) {
        throw new ApiError(
          502,
          'stripe_invalid_response',
          'Stripe did not return a checkout URL.'
        );
      }
      return { url: session.url };
    },

    async createPortalSession(userId, body) {
      ensureConfigured();
      requireText(userId, 'authenticated userId');
      if (userId.startsWith('demo_engineer_')) {
        throw new ApiError(
          403,
          'FORBIDDEN_DEMO_ACTION',
          'Demo profiles do not have billing privileges.'
        );
      }
      const returnUrl = requireText(body?.returnUrl, 'returnUrl');
      const subscription = await repository.getSubscriptionStatus(userId);
      if (!subscription?.stripeCustomerId) {
        throw new ApiError(
          404,
          'billing_customer_not_found',
          'No Stripe customer is linked to this user.'
        );
      }
      const session = await stripeClient!.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: returnUrl,
      });
      return { url: session.url };
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
      return resolveSubscription(sub, config.configured, !!stripeClient);
    },

    async processWebhook(rawBody, signature, onEventDetected) {
      ensureConfigured();
      if (!config.webhookSecret)
        throw new ApiError(
          503,
          'stripe_webhook_not_configured',
          'Stripe webhook verification is not configured.'
        );

      const event = verifyStripeSignature(
        stripeClient!,
        rawBody,
        signature,
        config.webhookSecret
      );
      if (typeof onEventDetected === 'function')
        onEventDetected('signature_verification', event.id, event.type);

      try {
        return await processWebhookEvent(repository, event);
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

export const createStripeClient = (config: {
  configured: boolean;
  secretKey: string | null;
}): Stripe | null => (config.configured ? new Stripe(config.secretKey!) : null);
