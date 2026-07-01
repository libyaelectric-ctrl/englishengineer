import Stripe from 'stripe';
import { ApiError } from './errors.js';

const requireText = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'invalid_request', `${field} is required.`);
  }
  return value.trim();
};

const emptySubscription = () => ({
  planId: 'free',
  status: 'none',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  updatedAt: new Date().toISOString(),
  source: 'backend',
});

export const createBillingService = ({ config, stripeClient, repository }) => {
  if (!repository) throw new Error('Billing repository is required.');
  const ensureConfigured = () => {
    if (!config.configured || !stripeClient) {
      throw new ApiError(
        503,
        'stripe_not_configured',
        'Billing backend is unavailable because Stripe is not configured.'
      );
    }
  };

  return {
    async createCheckoutSession(userId, body) {
      ensureConfigured();
      requireText(userId, 'authenticated userId');
      const email = requireText(body?.email, 'email');
      const successUrl = requireText(body?.successUrl, 'successUrl');
      const cancelUrl = requireText(body?.cancelUrl, 'cancelUrl');
      const planId = body?.planId === 'enterprise' ? 'team' : 'pro';
      const price =
        planId === 'team' ? config.priceTeamMonthly : config.priceProMonthly;
      if (!price) {
        throw new ApiError(
          503,
          'stripe_price_not_configured',
          `Stripe price for ${planId} is not configured.`
        );
      }
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

    async createPortalSession(userId, body) {
      ensureConfigured();
      requireText(userId, 'authenticated userId');
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
      if (!config.configured || !stripeClient) {
        return emptySubscription();
      }
      return (
        (await repository.getSubscriptionStatus(userId)) ?? emptySubscription()
      );
    },

    async processWebhook(rawBody, signature) {
      ensureConfigured();
      if (!config.webhookSecret) {
        throw new ApiError(
          503,
          'stripe_webhook_not_configured',
          'Stripe webhook verification is not configured.'
        );
      }
      let event;
      try {
        event = stripeClient.webhooks.constructEvent(
          rawBody,
          requireText(signature, 'Stripe-Signature'),
          config.webhookSecret
        );
      } catch {
        throw new ApiError(
          400,
          'invalid_webhook_signature',
          'Stripe webhook signature verification failed.'
        );
      }
      if (await repository.hasStripeEventBeenProcessed(event.id)) {
        return { received: true, duplicate: true, eventId: event.id };
      }

      const object = event.data?.object ?? {};
      const userId = object.metadata?.userId || object.client_reference_id;
      if (userId) {
        if (event.type === 'checkout.session.completed') {
          await repository.upsertSubscriptionStatus(userId, {
            planId: object.metadata?.planId === 'team' ? 'enterprise' : 'pro',
            status: 'active',
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            stripeCustomerId: object.customer || null,
            stripeSubscriptionId: object.subscription || null,
            updatedAt: new Date().toISOString(),
            source: 'stripe_webhook',
          });
        } else if (event.type === 'invoice.payment_failed') {
          const current =
            (await repository.getSubscriptionStatus(userId)) ??
            emptySubscription();
          await repository.upsertSubscriptionStatus(userId, {
            ...current,
            status: 'past_due',
            updatedAt: new Date().toISOString(),
            source: 'stripe_webhook',
          });
        } else if (event.type === 'customer.subscription.deleted') {
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
      await repository.markStripeEventProcessed(event.id, {
        type: event.type,
        processedAt: new Date().toISOString(),
      });
      return { received: true, duplicate: false, eventId: event.id };
    },
  };
};

export const createStripeClient = (config) =>
  config.configured ? new Stripe(config.secretKey) : null;

const getRequestUserId = (request) => {
  const authUserId = request.auth?.userId;
  if (typeof authUserId === 'string' && authUserId.trim()) {
    return authUserId.trim();
  }
  const claimedUserId = request.body?.userId ?? request.query?.userId;
  return typeof claimedUserId === 'string' && claimedUserId.trim()
    ? claimedUserId.trim()
    : null;
};

const assertUserOwnership = (request) => {
  const userId = getRequestUserId(request);
  if (!userId) return null;
  const claimedUserId = request.body?.userId ?? request.query?.userId;
  if (
    request.auth?.source !== 'dev-bypass' &&
    typeof claimedUserId === 'string' &&
    claimedUserId.trim() !== userId
  ) {
    throw new ApiError(
      403,
      'billing_user_mismatch',
      'Billing requests cannot target another user.'
    );
  }
  return userId;
};

export const registerBillingRoutes = (
  app,
  billingService,
  requireBackendAuth,
  rateLimiter,
  optionalBackendAuth = requireBackendAuth
) => {
  app.post(
    '/api/billing/create-checkout-session',
    requireBackendAuth,
    rateLimiter,
    async (req, res, next) => {
      try {
        res.json(
          await billingService.createCheckoutSession(
            assertUserOwnership(req),
            req.body
          )
        );
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    '/api/billing/create-customer-portal-session',
    requireBackendAuth,
    rateLimiter,
    async (req, res, next) => {
      try {
        res.json(
          await billingService.createPortalSession(
            assertUserOwnership(req),
            req.body
          )
        );
      } catch (error) {
        next(error);
      }
    }
  );
  const subscriptionStatusHandler = async (req, res, next) => {
    try {
      res.json(
        await billingService.getSubscriptionStatus(assertUserOwnership(req))
      );
    } catch (error) {
      next(error);
    }
  };

  const publicSubscriptionStatusAuth = async (req, res, next) => {
    try {
      await optionalBackendAuth(req, res, next);
    } catch {
      req.auth = null;
      next();
    }
  };

  app.get(
    '/api/billing/subscription-status',
    publicSubscriptionStatusAuth,
    rateLimiter,
    subscriptionStatusHandler
  );
  app.get(
    '/subscription-status',
    publicSubscriptionStatusAuth,
    rateLimiter,
    subscriptionStatusHandler
  );
  app.post('/api/webhooks/stripe', async (req, res, next) => {
    try {
      res.json(
        await billingService.processWebhook(
          req.body,
          req.headers['stripe-signature']
        )
      );
    } catch (error) {
      next(error);
    }
  });
};
