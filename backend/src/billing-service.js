import Stripe from 'stripe';
import { ApiError } from './errors.js';
import { requireText, emptySubscription } from './billing-helpers.js';

const PLAN_META = {
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

const PLAN_PRICE_CONFIG = {
  pro: 'priceProMonthly',
  project: 'priceProjectMonthly',
  max: 'priceMaxMonthly',
  exec: 'priceExecMonthly',
  private: 'pricePrivateMonthly',
  team: 'priceTeamMonthly',
};

const resolveOrProvisionPriceId = async (config, stripeClient, planId) => {
  const configKey = PLAN_PRICE_CONFIG[planId];
  if (configKey && config[configKey]) {
    return config[configKey];
  }

  const meta = PLAN_META[planId];
  if (!meta) {
    throw new ApiError(400, 'INVALID_PLAN', `Unknown plan: "${planId}".`);
  }

  const existingPrices = await stripeClient.prices.list({
    active: true,
    type: 'recurring',
    limit: 100,
  });

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

const resolveOrProvisionTopupPriceId = async (stripeClient) => {
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
  let product = existingProducts.data.find(
    (p) => p.name === 'AI Coach Top-up'
  );
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

export const createBillingService = ({ config, stripeClient, repository }) => {
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

      const price = await resolveOrProvisionPriceId(config, stripeClient, planId);

      const session = await stripeClient.checkout.sessions.create({
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

      const price = await resolveOrProvisionTopupPriceId(stripeClient);

      const session = await stripeClient.checkout.sessions.create({
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
      const session = await stripeClient.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: returnUrl,
      });
      return { url: session.url };
    },

    async getSubscriptionStatus(userIdValue) {
      const userId =
        typeof userIdValue === 'string' && userIdValue.trim()
          ? userIdValue.trim()
          : null;
      if (!userId) {
        return emptySubscription();
      }
      if (userId.startsWith('demo_engineer_')) {
        return emptySubscription();
      }

      let subscription;
      try {
        subscription = await repository.getSubscriptionStatus(userId);
      } catch (error) {
        throw new ApiError(
          503,
          'BILLING_STATUS_UNAVAILABLE',
          'Billing status is temporarily unavailable.'
        );
      }

      if (!config.configured || !stripeClient) {
        if (
          subscription &&
          subscription.planId !== 'free' &&
          subscription.status !== 'none'
        ) {
          return subscription;
        }
        return emptySubscription();
      }

      if (!subscription || !subscription.stripeCustomerId) {
        return emptySubscription();
      }

      return subscription;
    },

    async processWebhook(rawBody, signature, onEventDetected) {
      ensureConfigured();
      if (!config.webhookSecret) {
        throw new ApiError(
          503,
          'stripe_webhook_not_configured',
          'Stripe webhook verification is not configured.'
        );
      }
      let step = 'signature_verification';
      let event;
      try {
        event = stripeClient.webhooks.constructEvent(
          rawBody,
          requireText(signature, 'Stripe-Signature'),
          config.webhookSecret
        );
      } catch (err) {
        console.error(
          `[stripe-webhook-error] eventId=unknown type=unknown step=${step} ` +
            `errorName=${err.name} errorMessage="Stripe webhook signature verification failed." ` +
            `stackTrace=${err.stack} supabaseCode=N/A supabaseDetails=N/A`
        );
        throw new ApiError(
          400,
          'invalid_webhook_signature',
          'Stripe webhook signature verification failed.'
        );
      }

      const eventId = event.id;
      const eventType = event.type;

      if (typeof onEventDetected === 'function') {
        onEventDetected(step, eventId, eventType);
      }

      try {
        step = 'duplicate_check';
        if (await repository.hasStripeEventBeenProcessed(eventId)) {
          return { received: true, duplicate: true, eventId };
        }

        const object = event.data?.object ?? {};
        const userId = object.metadata?.userId || object.client_reference_id;
        if (userId) {
          if (eventType === 'checkout.session.completed') {
            step = 'process_checkout_completed';
            if (object.metadata?.type === 'topup') {
              const credits = parseInt(object.metadata?.credits || '50', 10);
              const current =
                (await repository.getSubscriptionStatus(userId)) ??
                emptySubscription();
              await repository.upsertSubscriptionStatus(userId, {
                ...current,
                topupCredits: (current.topupCredits || 0) + credits,
                updatedAt: new Date().toISOString(),
                source: 'stripe_webhook',
              });
            } else {
              const current =
                (await repository.getSubscriptionStatus(userId)) ??
                emptySubscription();
              await repository.upsertSubscriptionStatus(userId, {
                planId: object.metadata?.planId || 'pro',
                status: 'active',
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
                stripeCustomerId: object.customer || null,
                stripeSubscriptionId: object.subscription || null,
                updatedAt: new Date().toISOString(),
                source: 'stripe_webhook',
                topupCredits: current.topupCredits || 0,
              });
            }
          } else if (
            eventType === 'customer.subscription.created' ||
            eventType === 'customer.subscription.updated'
          ) {
            step = 'process_subscription_created_or_updated';
            const current =
              (await repository.getSubscriptionStatus(userId)) ??
              emptySubscription();
            const periodEndSec = object.current_period_end;
            const currentPeriodEnd =
              typeof periodEndSec === 'number' && periodEndSec > 0
                ? new Date(periodEndSec * 1000).toISOString()
                : null;

            await repository.upsertSubscriptionStatus(userId, {
              ...current,
              planId: object.metadata?.planId || current.planId || 'pro',
              status: object.status || 'active',
              currentPeriodEnd: currentPeriodEnd || current.currentPeriodEnd,
              cancelAtPeriodEnd:
                typeof object.cancel_at_period_end === 'boolean'
                  ? object.cancel_at_period_end
                  : current.cancelAtPeriodEnd,
              stripeCustomerId: object.customer || current.stripeCustomerId,
              stripeSubscriptionId: object.id || current.stripeSubscriptionId,
              updatedAt: new Date().toISOString(),
              source: 'stripe_webhook',
            });
          } else if (eventType === 'invoice.payment_failed') {
            step = 'process_payment_failed';
            const current =
              (await repository.getSubscriptionStatus(userId)) ??
              emptySubscription();
            await repository.upsertSubscriptionStatus(userId, {
              ...current,
              status: 'past_due',
              updatedAt: new Date().toISOString(),
              source: 'stripe_webhook',
            });
          } else if (eventType === 'customer.subscription.deleted') {
            step = 'process_subscription_deleted';
            const current =
              (await repository.getSubscriptionStatus(userId)) ??
              emptySubscription();
            await repository.upsertSubscriptionStatus(userId, {
              ...current,
              status: 'canceled',
              cancelAtPeriodEnd: false,
              updatedAt: new Date().toISOString(),
              source: 'stripe_webhook',
            });
          }
        }

        step = 'mark_processed';
        await repository.markStripeEventProcessed(eventId, {
          type: eventType,
          processedAt: new Date().toISOString(),
        });
        return { received: true, duplicate: false, eventId };
      } catch (err) {
        const supabaseCode = err.code || 'N/A';
        const supabaseDetails = err.details || 'N/A';
        console.error(
          `[stripe-webhook-error] eventId=${eventId} type=${eventType} step=${step} ` +
            `errorName=${err.name} errorMessage="${err.message || 'Unknown error'}" ` +
            `stackTrace=${err.stack} supabaseCode=${supabaseCode} supabaseDetails=${supabaseDetails}`
        );
        throw err;
      }
    },
  };
};

export const createStripeClient = (config) =>
  config.configured ? new Stripe(config.secretKey) : null;
