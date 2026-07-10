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
import { ApiError, toErrorResponse } from './errors.js';
import { createBackendAuth } from './auth.js';
import { createRateLimiter, createRateLimitStore } from './rate-limit.js';
import { createSubscriptionRepository } from './subscription-repository.js';
import {
  createVocabularyLookupService,
  registerVocabularyRoutes,
} from './vocabulary.js';
import {
  createWorkspaceRepository,
  registerWorkspaceRoutes,
} from './workspace.js';

export const createApp = ({
  config,
  fetchImpl = fetch,
  stripeClient = createStripeClient(config.stripe),
  billingRepository,
  workspaceRepository,
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
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
    express.raw({ type: 'application/json', limit: '1mb' }),
    (_req, _res, next) => next()
  );
  app.use(stripeRawRouter);
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/health', (_request, response) => {
    response.json(toPublicHealth(config));
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
  const workspaceRateLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    scope: 'workspace',
    store: rateLimitStore,
  });

  registerAIRoutes(
    app,
    createAIService(config.ai, fetchImpl),
    requireBackendAuth,
    aiRateLimiter,
    billingRepository ?? createSubscriptionRepository(config.stripe, fetchImpl),
    config,
    fetchImpl
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
  let resolvedWorkspaceRepository = workspaceRepository ?? null;
  if (!resolvedWorkspaceRepository && config.workspace?.configured) {
    try {
      resolvedWorkspaceRepository = createWorkspaceRepository(
        config,
        fetchImpl
      );
    } catch (err) {
      console.warn('[workspace] Failed to create workspace repository:', err);
    }
  }
  registerWorkspaceRoutes(app, requireBackendAuth, workspaceRateLimiter, {
    repository: resolvedWorkspaceRepository,
  });

  // Global rate limiter — protects all API routes not covered by specific limiters
  const globalRateLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max * 2,
    scope: 'global',
    store: rateLimitStore,
  });
  app.use('/api', globalRateLimiter);

  app.use((_request, _response, next) => {
    next(new ApiError(404, 'route_not_found', 'Route not found.'));
  });
  app.use((error, _request, response, _next) => {
    console.error('[unhandled-api-error]', error);
    const mapped = toErrorResponse(error);
    response.status(mapped.status).json(mapped.body);
  });

  return app;
};
