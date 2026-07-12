import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { createAIService, registerAIRoutes } from './ai.js';
import { createBillingService, createStripeClient } from './billing-service.js';
import { registerBillingRoutes } from './billing-routes.js';
import { registerAdminRoutes } from './admin-routes.js';
import { toPublicHealth } from './config.js';
import { ApiError, toErrorResponse } from './errors.js';
import { createBackendAuth } from './auth.js';
import { createRateLimiter, createRateLimitStore } from './rate-limit.js';
import { createSubscriptionRepository } from './subscription-repository.js';
import {
  createVocabularyLookupService,
  createUpstashVocabularyCache,
  registerVocabularyRoutes,
} from './vocabulary.js';
import {
  createWorkspaceRepository,
  registerWorkspaceRoutes,
} from './workspace.js';
import { createI18nMiddleware } from './i18n.js';
import { initAuditLog, getAuditLogs } from './audit-log.js';
import { validateQuery, AdminAuditLogsQuerySchema } from './validation.js';

export const createApp = ({
  config,
  fetchImpl = fetch,
  stripeClient = createStripeClient(config.stripe),
  billingRepository,
  workspaceRepository,
  rateLimitStore = createRateLimitStore(config.rateLimit, fetchImpl),
} = {}) => {
  if (!config) throw new Error('Backend config is required.');

  initAuditLog(config);

  // Initialize Sentry if DSN is configured
  if (config.sentry?.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      tracesSampleRate: config.sentry.tracesSampleRate,
    });
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", config.appOrigin],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      },
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

  // Timing Middleware (Performance Measurement)
  app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
      const diff = process.hrtime(start);
      const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      console.log(`[Timing] ${req.method} ${req.originalUrl} - ${timeMs}ms`);
    });
    next();
  });

  app.use(createI18nMiddleware());

  // API Versioning - v1 routes
  const v1Router = express.Router();
  app.use('/api/v1', v1Router);

  // Health check with real pings
  const healthHandler = async (_request, response) => {
    const health = toPublicHealth(config);
    const checks = { ...health.checks };
    const TIMEOUT_MS = 5000;

    // Real Supabase ping
    if (config.supabase?.configured) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          config.auth.supabaseUrl,
          config.auth.supabaseAnonKey
        );
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
        );
        const pingPromise = supabase
          .from('subscriptions')
          .select('id')
          .limit(1);
        await Promise.race([pingPromise, timeoutPromise]);
        checks.supabase = { configured: true, reachable: true };
      } catch (err) {
        checks.supabase = {
          configured: true,
          reachable: false,
          error: err.message,
        };
        health.status = 'degraded';
        health.ok = false;
      }
    }

    // Real Redis ping (Upstash)
    if (
      config.rateLimit?.storeMode === 'upstash' &&
      config.rateLimit?.upstashUrl
    ) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
        );
        const pingPromise = fetch(`${config.rateLimit.upstashUrl}/ping`, {
          headers: { Authorization: `Bearer ${config.rateLimit.upstashToken}` },
        });
        const res = await Promise.race([pingPromise, timeoutPromise]);
        checks.rateLimit = { configured: true, reachable: res.ok };
        if (!res.ok) {
          health.status = 'degraded';
          health.ok = false;
        }
      } catch (err) {
        checks.rateLimit = {
          configured: true,
          reachable: false,
          error: err.message,
        };
        health.status = 'degraded';
        health.ok = false;
      }
    }

    response.json({ ...health, checks });
  };

  // Register health on both v1 and legacy paths
  v1Router.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

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
  const vocabCache =
    config.rateLimit.storeMode === 'upstash'
      ? createUpstashVocabularyCache({
          url: config.rateLimit.upstashUrl,
          token: config.rateLimit.upstashToken,
          timeoutMs: config.rateLimit.storeTimeoutMs,
          fetchImpl,
        })
      : new Map();

  registerVocabularyRoutes(
    app,
    createVocabularyLookupService(config.vocabulary, fetchImpl, vocabCache),
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

  // Admin audit logs endpoint
  app.get(
    '/api/admin/audit-logs',
    requireBackendAuth,
    validateQuery(AdminAuditLogsQuerySchema),
    async (req, res, next) => {
      try {
        const userId = req.auth?.userId;
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'Authentication required.'
          );
        }
        const isAdmin =
          userId === 'engineeros-dev-user' ||
          req.auth?.source === 'internal-secret';
        if (!isAdmin) {
          throw new ApiError(403, 'admin_required', 'Admin access required.');
        }
        const filters = {
          userId: req.validatedQuery.userId || undefined,
          action: req.validatedQuery.action || undefined,
          since: req.validatedQuery.since || undefined,
          limit: req.validatedQuery.limit,
        };
        const logs = await getAuditLogs(filters);
        res.json({ success: true, data: logs });
      } catch (error) {
        next(error);
      }
    }
  );

  // Global rate limiter — protects all API routes not covered by specific limiters
  const globalRateLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max * 2,
    scope: 'global',
    store: rateLimitStore,
  });
  app.use('/api', globalRateLimiter);

  // Admin routes (after global rate limiter)
  registerAdminRoutes(app, requireBackendAuth, globalRateLimiter);

  app.use((_request, _response, next) => {
    next(new ApiError(404, 'route_not_found', 'Route not found.'));
  });
  app.use((error, request, response, _next) => {
    console.error('[unhandled-api-error]', error);
    // Send to Sentry if configured
    if (config.sentry?.dsn) {
      Sentry.captureException(error);
    }
    const mapped = toErrorResponse(error);
    if (request.i18n && mapped.body?.error?.code) {
      const translated = request.i18n.t(mapped.body.error.code);
      if (translated !== mapped.body.error.code) {
        mapped.body.error.message = translated;
      }
    }
    response.status(mapped.status).json(mapped.body);
  });

  return app;
};
