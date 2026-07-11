import { auditLog, AUDIT_ACTIONS } from './audit-log.js';
import { assertUserOwnership } from './billing-helpers.js';
import {
  validateBody,
  BillingCheckoutBodySchema,
  BillingTopupBodySchema,
  BillingPortalBodySchema,
} from './validation.js';

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
    validateBody(BillingCheckoutBodySchema),
    async (req, res, next) => {
      try {
        const userId = assertUserOwnership(req);
        auditLog({
          action: AUDIT_ACTIONS.CHECKOUT_CREATED,
          userId,
          details: { planId: req.body?.planId },
        });
        res.json(await billingService.createCheckoutSession(userId, req.body));
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    '/api/billing/create-topup-session',
    requireBackendAuth,
    rateLimiter,
    validateBody(BillingTopupBodySchema),
    async (req, res, next) => {
      try {
        const userId = assertUserOwnership(req);
        auditLog({
          action: AUDIT_ACTIONS.CHECKOUT_CREATED,
          userId,
          details: { type: 'topup', credits: 50 },
        });
        res.json(
          await billingService.createTopupCheckoutSession(userId, req.body)
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
    validateBody(BillingPortalBodySchema),
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
    let eventId = 'unknown';
    let eventType = 'unknown';
    try {
      if (req.body) {
        const parsedBody = JSON.parse(req.body.toString('utf8'));
        if (parsedBody && typeof parsedBody === 'object') {
          eventId = parsedBody.id || 'unknown';
          eventType = parsedBody.type || 'unknown';
        }
      }
    } catch (err) { console.warn('[stripe-webhook-log-parse]', err?.message); }

    auditLog({
      action: AUDIT_ACTIONS.WEBHOOK_RECEIVED,
      details: { eventId, eventType },
    });

    console.log(`[stripe-webhook-received] eventId=${eventId} type=${eventType}`);

    try {
      res.json(
        await billingService.processWebhook(
          req.body,
          req.headers['stripe-signature'],
          (step, evId, evType) => {
            if (evId) eventId = evId;
            if (evType) eventType = evType;
          }
        )
      );
    } catch (error) {
      next(error);
    }
  });
};
