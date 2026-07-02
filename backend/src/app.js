import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createAIService, registerAIRoutes } from './ai.js';
import {
  createBillingService,
  createStripeClient,
  registerBillingRoutes,
} from './billing.js';
import { toPublicHealth } from './config.js';
import { toErrorResponse } from './errors.js';
import { createBackendAuth } from './auth.js';
import { createRateLimiter, createRateLimitStore } from './rate-limit.js';
import { createSubscriptionRepository } from './subscription-repository.js';
import {
  createVocabularyLookupService,
  registerVocabularyRoutes,
} from './vocabulary.js';

export const createApp = ({
  config,
  fetchImpl = fetch,
  stripeClient = createStripeClient(config.stripe),
  billingRepository,
  rateLimitStore = createRateLimitStore(config.rateLimit, fetchImpl),
} = {}) => {
  if (!config) throw new Error('Backend config is required.');

  const app = express();
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: config.appOrigin,
      methods: ['GET', 'POST'],
      allowedHeaders: [
        'Authorization',
        'Content-Type',
        'Stripe-Signature',
        'X-EngineerOS-AI-Contract',
        'X-EngineerOS-Request-Id',
        'X-EngineerOS-User-Id',
        'X-EngineerOS-User-Email',
      ],
    })
  );

  const stripeRawRouter = express.Router();
  stripeRawRouter.post(
    '/api/webhooks/stripe',
    express.raw({ type: 'application/json', limit: '1mb' })
  );
  app.use(stripeRawRouter);
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/health', (_request, response) => {
    response.json(toPublicHealth(config));
  });

  app.get('/api/debug/last-error', (_request, response) => {
    response.json(app.locals.lastError || { message: 'No error recorded.' });
  });

  app.get('/api/debug/db-check', async (_request, response, next) => {
    try {
      const supabaseUrl = config.stripe.supabaseUrl;
      const serviceRoleKey = config.stripe.supabaseServiceRoleKey;
      if (!supabaseUrl || !serviceRoleKey) {
        return response.json({ error: 'Supabase configuration is missing in config.stripe' });
      }
      const restUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1`;

      const eventsRes = await fetchImpl(`${restUrl}/stripe_processed_events?select=*&limit=5`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        }
      });
      const events = await eventsRes.json();

      const subsRes = await fetchImpl(`${restUrl}/subscription_status?select=*&limit=5`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        }
      });
      const subs = await subsRes.json();

      response.json({ events, subs });
    } catch (err) {
      next(err);
    }
  });

  const backendAuth = createBackendAuth(config.auth, fetchImpl);
  const { requireBackendAuth, optionalBackendAuth } = backendAuth;
  const aiRateLimiter = createRateLimiter({
    windowMs: config.ai.rateLimitWindowMs,
    max: config.ai.rateLimitMax,
    scope: 'ai',
    store: rateLimitStore,
  });
  const billingRateLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    scope: 'billing',
    store: rateLimitStore,
  });
  const vocabularyRateLimiter = createRateLimiter({
    windowMs: config.vocabulary.rateLimitWindowMs,
    max: config.vocabulary.rateLimitMax,
    scope: 'vocabulary',
    store: rateLimitStore,
  });

  registerAIRoutes(
    app,
    createAIService(config.ai, fetchImpl),
    requireBackendAuth,
    aiRateLimiter
  );
  registerVocabularyRoutes(
    app,
    createVocabularyLookupService(config.vocabulary, fetchImpl),
    vocabularyRateLimiter
  );
  registerBillingRoutes(
    app,
    createBillingService({
      config: config.stripe,
      stripeClient,
      repository:
        billingRepository ??
        createSubscriptionRepository(config.stripe, fetchImpl),
    }),
    requireBackendAuth,
    billingRateLimiter,
    optionalBackendAuth
  );

  app.use((_request, _response, next) => {
    next(new Error('Route not found.'));
  });
  app.use((error, _request, response, _next) => {
    console.error('[unhandled-api-error]', error);
    const mapped = toErrorResponse(error);
    app.locals.lastError = {
      code: mapped.body?.error?.code || 'internal_error',
      message: mapped.body?.error?.message || 'The backend could not complete the request.',
      ...(error.step ? { step: error.step } : {}),
      timestamp: new Date().toISOString(),
    };
    response.status(mapped.status).json(mapped.body);
  });

  return app;
};
