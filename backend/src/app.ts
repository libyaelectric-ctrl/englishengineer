import cors from 'cors';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
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
import { swaggerSpec } from './swagger.js';
import { logger } from './logger.js';
import {
  createIdempotencyStore,
  setGlobalIdempotencyStore,
} from './middleware/idempotency.middleware.js';
import type { BackendConfig } from '../types.js';
import type { WorkspaceRepository } from './workspace-repository.js';
import type { SubscriptionRepository } from './subscription-repository.js';
import { createSubscriptionRepository } from './subscription-repository.js';

interface CreateAppOpts {
  config?: BackendConfig;
  fetchImpl?: typeof fetch;
  stripeClient?: ReturnType<typeof createStripeClient>;
  billingRepository?: SubscriptionRepository;
  workspaceRepository?: WorkspaceRepository | null;
  rateLimitStore?: any;
}

export const createApp = ({
  config,
  fetchImpl = fetch,
  stripeClient = createStripeClient(config!.stripe),
  billingRepository,
  workspaceRepository,
  rateLimitStore = createRateLimitStore(config!.rateLimit, fetchImpl),
}: CreateAppOpts = {}) => {
  if (!config) throw new Error('Backend config is required.');

  initAuditLog(config);

  const idempotencyStore = createIdempotencyStore(
    config.rateLimit.storeMode === 'upstash' ? 'redis' : 'memory',
    config as any,
    fetchImpl
  );
  setGlobalIdempotencyStore(idempotencyStore);

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
          connectSrc: ["'self'", config.appOrigin, 'https://sentry.io'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          baseUri: ["'self'"],
          upgradeInsecureRequests: [],
          reportUri: ['/api/csp-report'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );
  const allowedOrigins = [
    config.appOrigin,
    'https://englishengineer.vercel.app',
    'https://www.englishengineer.vercel.app',
  ].filter(Boolean);

  if (config.environment === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (
        req.headers['x-forwarded-proto'] !== 'https' &&
        req.method !== 'GET'
      ) {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  app.use(
    cors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
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
    (_req: Request, _res: Response, next: NextFunction) => next()
  );
  app.use(stripeRawRouter);
  app.use(express.json({ limit: '256kb' }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    res.on('finish', () => {
      const diff = process.hrtime(start);
      const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      logger.info('Timing', {
        method: req.method,
        path: req.originalUrl,
        timeMs,
      });
    });
    next();
  });

  app.use(createI18nMiddleware());

  const v1Router = express.Router();
  app.use('/api/v1', v1Router);

  const healthHandler = async (_request: Request, response: Response) => {
    const health = toPublicHealth(config);
    const checks: Record<string, any> = { ...health.checks };
    const TIMEOUT_MS = 5000;

    if (config.supabase?.configured) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          config.auth.supabaseUrl!,
          config.auth.supabaseAnonKey!
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
      } catch (err: any) {
        checks.supabase = {
          configured: true,
          reachable: false,
          error: err.message,
        };
        health.status = 'degraded';
        health.ok = false;
      }
    }

    if (
      config.rateLimit?.storeMode === 'upstash' &&
      config.rateLimit?.upstashUrl
    ) {
      try {
        const timeoutPromise: Promise<Response> = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
        );
        const pingPromise = fetch(`${config.rateLimit.upstashUrl}/ping`, {
          headers: { Authorization: `Bearer ${config.rateLimit.upstashToken}` },
        });
        const pingRes = (await Promise.race([
          pingPromise,
          timeoutPromise,
        ])) as globalThis.Response;
        checks.rateLimit = { configured: true, reachable: pingRes.ok };
        if (!pingRes.ok) {
          health.status = 'degraded';
          health.ok = false;
        }
      } catch (err: any) {
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

  v1Router.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  app.get('/api-docs.json', (_req: Request, res: Response) =>
    res.json(swaggerSpec)
  );
  app.get('/api-docs', (_req: Request, res: Response) => {
    res.send(
      `<!DOCTYPE html><html><head><title>EngineerOS API Docs</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head><body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({url:'/api-docs.json',dom_id:'#swagger-ui'})</script></body></html>`
    );
  });

  app.post(
    '/api/csp-report',
    express.json({ type: 'application/csp-report' }),
    (req: Request, res: Response) => {
      logger.warn('CSP violation reported', { report: req.body });
      res.status(204).end();
    }
  );

  const backendAuth = createBackendAuth(
    { ...config.auth, environment: config.environment } as any,
    fetchImpl
  );
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
          url: config.rateLimit.upstashUrl!,
          token: config.rateLimit.upstashToken!,
          timeoutMs: config.rateLimit.storeTimeoutMs,
          fetchImpl,
        })
      : new Map();

  registerVocabularyRoutes(
    app,
    createVocabularyLookupService(
      config.vocabulary,
      fetchImpl,
      vocabCache as any
    ),
    vocabularyRateLimiter
  );
  registerBillingRoutes(
    app,
    createBillingService({
      config: config.stripe as any,
      stripeClient: stripeClient as any,
      repository:
        billingRepository ??
        createSubscriptionRepository(config.stripe, fetchImpl),
    }),
    requireBackendAuth,
    billingRateLimiter,
    optionalBackendAuth
  );
  let resolvedWorkspaceRepository: WorkspaceRepository | null =
    workspaceRepository ?? null;
  if (!resolvedWorkspaceRepository && config.workspace?.configured) {
    try {
      resolvedWorkspaceRepository = createWorkspaceRepository(
        config,
        fetchImpl
      );
    } catch (err: any) {
      logger.warn('Failed to create workspace repository', {
        error: err.message,
      });
    }
  }
  registerWorkspaceRoutes(app, requireBackendAuth, workspaceRateLimiter, {
    repository: resolvedWorkspaceRepository,
  });

  app.get(
    '/api/admin/audit-logs',
    requireBackendAuth,
    validateQuery(AdminAuditLogsQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).auth?.userId;
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'Authentication required.'
          );
        }
        const isAdmin =
          userId === 'engineeros-dev-user' ||
          (req as any).auth?.source === 'internal-secret';
        if (!isAdmin) {
          throw new ApiError(403, 'admin_required', 'Admin access required.');
        }
        const filters = {
          userId: (req as any).validatedQuery.userId || undefined,
          action: (req as any).validatedQuery.action || undefined,
          since: (req as any).validatedQuery.since || undefined,
          limit: (req as any).validatedQuery.limit,
        };
        const logs = await getAuditLogs(filters);
        res.json({ success: true, data: logs });
      } catch (error) {
        next(error);
      }
    }
  );

  const globalRateLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max * 2,
    scope: 'global',
    store: rateLimitStore,
  });
  app.use('/api', globalRateLimiter);

  registerAdminRoutes(app, requireBackendAuth, globalRateLimiter);

  app.use((_request: Request, _response: Response, next: NextFunction) => {
    next(new ApiError(404, 'route_not_found', 'Route not found.'));
  });
  app.use(
    (error: any, request: Request, response: Response, _next: NextFunction) => {
      logger.error('Unhandled API error', { path: request.path }, error);
      if (config.sentry?.dsn) {
        Sentry.captureException(error);
      }
      const mapped = toErrorResponse(error);
      if ((request as any).i18n && mapped.body?.error?.code) {
        const translated = (request as any).i18n.t(mapped.body.error.code);
        if (translated !== mapped.body.error.code) {
          mapped.body.error.message = translated;
        }
      }
      response.status(mapped.status).json(mapped.body);
    }
  );

  return app;
};
