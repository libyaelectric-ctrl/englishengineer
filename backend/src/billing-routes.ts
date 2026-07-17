import { logger } from './logger.js';
import { auditLog, AUDIT_ACTIONS } from './audit-log.js';
import { assertUserOwnership } from './billing-helpers.js';
import { idempotencyKey } from './middleware/idempotency.middleware.js';
import {
  validateBody,
  BillingCheckoutBodySchema,
  BillingTopupBodySchema,
  BillingPortalBodySchema,
} from './validation.js';
import type { BillingService } from './billing-service.js';
import type { Request, Response, NextFunction } from 'express';

export const registerBillingRoutes = (
  app: any,
  billingService: BillingService,
  requireBackendAuth: any,
  rateLimiter: any,
  optionalBackendAuth: any = requireBackendAuth
): void => {
  app.post(
    '/api/billing/create-checkout-session',
    requireBackendAuth,
    rateLimiter,
    idempotencyKey(),
    validateBody(BillingCheckoutBodySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = assertUserOwnership(req);
        auditLog({
          action: AUDIT_ACTIONS.CHECKOUT_CREATED,
          userId: userId || undefined,
          details: { planId: req.body?.planId },
        });
        res.json(await billingService.createCheckoutSession(userId || '', req.body));
      } catch (error) {
        next(error);
      }
    }
  );
  app.post(
    '/api/billing/create-topup-session',
    requireBackendAuth,
    rateLimiter,
    idempotencyKey(),
    validateBody(BillingTopupBodySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = assertUserOwnership(req);
        auditLog({
          action: AUDIT_ACTIONS.CHECKOUT_CREATED,
          userId: userId || undefined,
          details: { type: 'topup', credits: 50 },
        });
        res.json(
          await billingService.createTopupCheckoutSession(userId || '', req.body)
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
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.json(
          await billingService.createPortalSession(
            assertUserOwnership(req) || '',
            req.body
          )
        );
      } catch (error) {
        next(error);
      }
    }
  );
  const subscriptionStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await billingService.getSubscriptionStatus(assertUserOwnership(req))
      );
    } catch (error) {
      next(error);
    }
  };

  const publicSubscriptionStatusAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await optionalBackendAuth(req, res, next);
    } catch {
      (req as any).auth = null;
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
  app.post('/api/webhooks/stripe', async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Stripe webhook log parse error', { error: err?.message });
      }
    }

    auditLog({
      action: AUDIT_ACTIONS.WEBHOOK_RECEIVED,
      details: { eventId, eventType },
    });

    try {
      res.json(
        await billingService.processWebhook(
          req.body,
          req.headers['stripe-signature'] as string | undefined,
          (step: string, evId: string, evType: string) => {
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
