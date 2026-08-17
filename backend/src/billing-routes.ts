import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { AUDIT_ACTIONS, auditLog } from './audit-log.js';
import { assertUserOwnership } from './billing-helpers.js';
import type { BillingService } from './billing-service.js';
import { logger } from './logger.js';
import { idempotencyKey } from './middleware/idempotency.middleware.js';
import {
  BillingCheckoutBodySchema,
  BillingPortalBodySchema,
  BillingTopupBodySchema,
  validateBody,
} from './validation.js';

export const registerBillingRoutes = (
  app: Express,
  billingService: BillingService,
  requireBackendAuth: RequestHandler,
  rateLimiter: RequestHandler,
  optionalBackendAuth: RequestHandler = requireBackendAuth
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
        res.json(await billingService.createTopupCheckoutSession(userId || '', req.body));
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
          await billingService.createPortalSession(assertUserOwnership(req) || '', req.body)
        );
      } catch (error) {
        next(error);
      }
    }
  );
  const subscriptionStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await billingService.getSubscriptionStatus(assertUserOwnership(req)));
    } catch (error) {
      next(error);
    }
  };

  const publicSubscriptionStatusAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await optionalBackendAuth(req, res, next);
    } catch {
      req.auth = undefined;
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
  for (const webhookRoute of billingService.provider?.webhookRoutes ?? []) {
    app.post(webhookRoute.path, async (req: Request, res: Response, next: NextFunction) => {
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
      } catch (err: unknown) {
        if (process.env.NODE_ENV !== 'production') {
          logger.warn('Webhook log parse error', {
            error: err instanceof Error ? err.message : String(err),
          });
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
            req.headers,
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
  }
};
