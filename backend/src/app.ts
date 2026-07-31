import * as Sentry from '@sentry/node';
import cors from 'cors';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import helmet from 'helmet';
import path from 'node:path';
import type Stripe from 'stripe';

import type { BackendConfig } from '../types.js';
import { registerAdminRoutes } from './admin-routes.js';
import { createAIService, registerAIRoutes } from './ai.js';
import { getAuditLogs, initAuditLog } from './audit-log.js';
import { createBackendAuth } from './auth.js';
import type { BackendAuthConfig } from './auth.js';
import { registerBillingRoutes } from './billing-routes.js';
import { createBillingService, createStripeClient } from './billing-service.js';
import type { BillingServiceConfig } from './billing-service.js';
import { getPoolConfig } from './cache/connection-pool.js';
import { initRedisCache } from './cache/redis-cache.service.js';
import { toPublicHealth } from './config.js';
import { ApiError, toErrorResponse } from './errors.js';
import { registerGrammarRoutes } from './grammar-routes.js';
import { createI18nMiddleware } from './i18n.js';
import { registerListeningRoutes } from './listening-routes.js';
import { logger } from './logger.js';
import { csrfProtection } from './middleware/csrf.middleware.js';
import {
  createIdempotencyStore,
  setGlobalIdempotencyStore,
} from './middleware/idempotency.middleware.js';
import { requireTenantContext } from './middleware/tenant.middleware.js';
import { registerProgressRoutes } from './progress-routes.js';
import { getPrometheusMetrics } from './prometheus.js';
import { createRateLimitStore, createRateLimiter } from './rate-limit.js';
import type { UpstashRateLimitStore } from './rate-limit.js';
import { registerReadingRoutes } from './reading-routes.js';
import { registerSpeakingRoutes } from './speaking-routes.js';
import type { SubscriptionRepository } from './subscription-repository.js';
import { createSubscriptionRepository } from './subscription-repository.js';
import { swaggerSpec } from './swagger.js';
import { AdminAuditLogsQuerySchema, validateQuery } from './validation.js';
import type { VocabularyCache } from './vocabulary-service.js';
import {
  createUpstashVocabularyCache,
  createVocabularyLookupService,
  registerVocabularyRoutes,
} from './vocabulary.js';
import type { WorkspaceRepository } from './workspace-repository.js';
import { createWorkspaceRepository, registerWorkspaceRoutes } from './workspace.js';
import { registerWritingRoutes } from './writing-routes.js';

const SECURITY_HEADERS = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://englishengineer-production.up.railway.app'],
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
  crossOriginResourcePolicy: { policy: 'cross-origin' as const },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false,
};

const checkSupabaseHealth = async (
  config: BackendConfig,
  checks: Record<string, unknown>,
  health: { status: string; ok: boolean }
) => {
  const TIMEOUT_MS = 5000;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(config.auth.supabaseUrl!, config.auth.supabaseAnonKey!);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
    );
    const pingPromise = supabase.from('subscriptions').select('id').limit(1);
    await Promise.race([pingPromise, timeoutPromise]);
    checks.supabase = { configured: true, reachable: true };
  } catch (err: unknown) {
    checks.supabase = {
      configured: true,
      reachable: false,
      error: err instanceof Error ? err.message : String(err),
    };
    health.status = 'degraded';
    health.ok = false;
  }
};

const checkUpstashHealth = async (
  config: BackendConfig,
  checks: Record<string, unknown>,
  health: { status: string; ok: boolean }
) => {
  if (config.rateLimit?.storeMode !== 'upstash' || !config.rateLimit?.upstashUrl) return;
  const TIMEOUT_MS = 5000;
  try {
    const timeoutPromise: Promise<Response> = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
    );
    const pingPromise = fetch(`${config.rateLimit.upstashUrl}/ping`, {
      headers: { Authorization: `Bearer ${config.rateLimit.upstashToken}` },
    });
    const pingRes = (await Promise.race([pingPromise, timeoutPromise])) as globalThis.Response;
    checks.rateLimit = { configured: true, reachable: pingRes.ok };
    if (!pingRes.ok) {
      health.status = 'degraded';
      health.ok = false;
    }
  } catch (err: unknown) {
    checks.rateLimit = {
      configured: true,
      reachable: false,
      error: err instanceof Error ? err.message : String(err),
    };
    health.status = 'degraded';
    health.ok = false;
  }
};

interface CreateAppOpts {
  config?: BackendConfig;
  fetchImpl?: typeof fetch;
  stripeClient?: ReturnType<typeof createStripeClient>;
  billingRepository?: SubscriptionRepository;
  workspaceRepository?: WorkspaceRepository | null;
  rateLimitStore?: UpstashRateLimitStore | null;
}

const setupMiddleware = (app: Express, config: BackendConfig) => {
  if (!config.appOrigin) {
    if (config.environment === 'production') {
      throw new Error(
        'APP_ORIGIN is required in production. Refusing to start without a configured origin.'
      );
    }
    logger.warn(
      'APP_ORIGIN is not set. CORS will allow all origins in development mode. Set APP_ORIGIN for production.'
    );
  }

  app.disable('x-powered-by');
  SECURITY_HEADERS.contentSecurityPolicy.directives.connectSrc = [
    "'self'",
    config.appOrigin,
    'https://sentry.io',
  ];
  app.use(helmet(SECURITY_HEADERS as Parameters<typeof helmet>[0]));

  const allowedOrigins = [
    config.appOrigin,
    'https://englishengineer.vercel.app',
    'https://www.englishengineer.vercel.app',
  ].filter(Boolean);

  if (config.environment === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.headers['x-forwarded-proto'] !== 'https' && req.method !== 'GET') {
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
        if (!origin || allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
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
        'X-CSRF-Token',
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
  app.use(csrfProtection);

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
};

const createAllRateLimiters = (
  config: BackendConfig,
  rateLimitStore: UpstashRateLimitStore | null
) => ({
  ai: createRateLimiter({
    windowMs: config.ai.rateLimitWindowMs,
    max: config.ai.rateLimitMax,
    scope: 'ai',
    store: rateLimitStore,
  }),
  billing: createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    scope: 'billing',
    store: rateLimitStore,
  }),
  vocabulary: createRateLimiter({
    windowMs: config.vocabulary.rateLimitWindowMs,
    max: config.vocabulary.rateLimitMax,
    scope: 'vocabulary',
    store: rateLimitStore,
  }),
  workspace: createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    scope: 'workspace',
    store: rateLimitStore,
  }),
  global: createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max * 2,
    scope: 'global',
    store: rateLimitStore,
  }),
});

const resolveWorkspaceRepo = (
  workspaceRepository: WorkspaceRepository | null | undefined,
  config: BackendConfig
): WorkspaceRepository | null => {
  if (workspaceRepository) return workspaceRepository;
  if (!config.workspace?.configured) return null;
  try {
    return createWorkspaceRepository(config);
  } catch (err: unknown) {
    logger.warn('Failed to create workspace repository', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
};

const parseAuditLogsFilters = (req: Request) => {
  const q = (req.validatedQuery ?? {}) as Record<string, unknown>;
  return {
    userId: typeof q.userId === 'string' ? q.userId : undefined,
    action: typeof q.action === 'string' ? q.action : undefined,
    since: typeof q.since === 'string' ? q.since : undefined,
    limit: typeof q.limit === 'number' ? q.limit : undefined,
  };
};

const applyI18nTranslation = (request: Request, mapped: ReturnType<typeof toErrorResponse>) => {
  if (!request.i18n || !mapped.body?.error?.code) return;
  const translated = request.i18n.t(mapped.body.error.code);
  if (translated !== mapped.body.error.code) mapped.body.error.message = translated;
};

const handleApiError =
  (config: BackendConfig) =>
  (error: unknown, request: Request, response: Response, _next: NextFunction) => {
    logger.error(
      'Unhandled API error',
      { path: request.path },
      error instanceof Error ? error : undefined
    );
    if (config.sentry?.dsn)
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
    const mapped = toErrorResponse(error instanceof Error ? error : new Error(String(error)));
    applyI18nTranslation(request, mapped);
    response.status(mapped.status).json(mapped.body);
  };

const registerRoutes = (
  app: Express,
  config: BackendConfig,
  fetchImpl: typeof fetch,
  stripeClient: ReturnType<typeof createStripeClient>,
  billingRepository: SubscriptionRepository | undefined,
  workspaceRepository: WorkspaceRepository | null | undefined,
  rateLimitStore: UpstashRateLimitStore | null
) => {
  const v1Router = express.Router();
  app.use('/api/v1', v1Router);

  const adaptPath = (path: string) => {
    if (path.startsWith('/api/')) {
      return path.slice(4);
    }
    return path;
  };

  const v1RouterAdapter = {
    get: (path: string, ...handlers: any[]) => {
      v1Router.get(adaptPath(path), ...handlers);
      app.get(path, ...handlers);
      return v1RouterAdapter;
    },
    post: (path: string, ...handlers: any[]) => {
      v1Router.post(adaptPath(path), ...handlers);
      app.post(path, ...handlers);
      return v1RouterAdapter;
    },
    put: (path: string, ...handlers: any[]) => {
      v1Router.put(adaptPath(path), ...handlers);
      app.put(path, ...handlers);
      return v1RouterAdapter;
    },
    delete: (path: string, ...handlers: any[]) => {
      v1Router.delete(adaptPath(path), ...handlers);
      app.delete(path, ...handlers);
      return v1RouterAdapter;
    },
    use: (...args: any[]) => {
      if (typeof args[0] === 'string') {
        const path = args[0];
        const handlers = args.slice(1);
        v1Router.use(adaptPath(path), ...handlers);
        app.use(path, ...handlers);
      } else {
        v1Router.use(...args);
        app.use(...args);
      }
      return v1RouterAdapter;
    },
    disable: () => {},
    enabled: () => false,
  };

  const healthHandler = async (_request: Request, response: Response) => {
    const startTime = Date.now();
    const health = toPublicHealth(config);
    const checks: Record<string, unknown> = { ...health.checks };
    if (config.supabase?.configured) await checkSupabaseHealth(config, checks, health);
    await checkUpstashHealth(config, checks, health);
    const responseTime = Date.now() - startTime;
    response.json({
      ...health,
      checks,
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString(),
      stripeConfigured: (checks.stripe as { configured?: boolean })?.configured ?? false,
    });
  };

  v1Router.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Prometheus metrics endpoint
  app.get('/api/metrics', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.send(getPrometheusMetrics());
  });

  app.get('/api-docs.json', (_req: Request, res: Response) => res.json(swaggerSpec));
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

  // Redirect middleware for legacy /api routes to /api/v1 routes
  app.use((req: Request, res: Response, next: NextFunction): void => {
    if (
      process.env.NODE_ENV !== 'test' &&
      req.path.startsWith('/api/') &&
      !req.path.startsWith('/api/v1/') &&
      req.path !== '/api/health' &&
      req.path !== '/api/metrics' &&
      req.path !== '/api/csp-report'
    ) {
      res.setHeader('Deprecation', 'true');
      res.setHeader('Sunset', '2026-12-31');
      res.setHeader(
        'Link',
        `<${req.protocol}://${req.get('host')}/api/v1${req.url.slice(4)}>; rel="successor-version"`
      );
      res.redirect(307, `/api/v1${req.url.slice(4)}`);
      return;
    }
    next();
  });

  const backendAuth = createBackendAuth(
    { ...config.auth, environment: config.environment } as BackendAuthConfig,
    fetchImpl
  );
  const { requireBackendAuth, optionalBackendAuth } = backendAuth;
  const limiters = createAllRateLimiters(config, rateLimitStore);

  registerAIRoutes(
    v1RouterAdapter as unknown as Express,
    createAIService(config.ai, fetchImpl) as unknown as Parameters<typeof registerAIRoutes>[1],
    requireBackendAuth,
    limiters.ai,
    billingRepository ??
      createSubscriptionRepository(
        {
          ...config.stripe,
          supabaseUrl: config.stripe.supabaseUrl ?? undefined,
          supabaseServiceRoleKey: config.stripe.supabaseServiceRoleKey ?? undefined,
        },
        fetchImpl
      ),
    config as unknown as Parameters<typeof registerAIRoutes>[5],
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
    v1RouterAdapter as unknown as Express,
    createVocabularyLookupService(config.vocabulary, fetchImpl, vocabCache as VocabularyCache),
    limiters.vocabulary
  );

  registerBillingRoutes(
    v1RouterAdapter as unknown as Express,
    createBillingService({
      config: config.stripe as unknown as BillingServiceConfig,
      stripeClient: stripeClient as Stripe,
      repository:
        billingRepository ??
        createSubscriptionRepository(
          {
            ...config.stripe,
            supabaseUrl: config.stripe.supabaseUrl ?? undefined,
            supabaseServiceRoleKey: config.stripe.supabaseServiceRoleKey ?? undefined,
          },
          fetchImpl
        ),
    }),
    requireBackendAuth,
    limiters.billing,
    optionalBackendAuth
  );

  const resolvedWorkspaceRepository = resolveWorkspaceRepo(workspaceRepository, config);
  registerWorkspaceRoutes(
    v1RouterAdapter as unknown as Express,
    [requireBackendAuth, requireTenantContext] as unknown as RequestHandler,
    limiters.workspace,
    {
      repository: resolvedWorkspaceRepository,
    }
  );

  const auditLogsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new ApiError(401, 'authentication_required', 'Authentication required.');
      const isAdmin = userId === 'engineeros-dev-user' || req.auth?.source === 'internal-secret';
      if (!isAdmin) throw new ApiError(403, 'admin_required', 'Admin access required.');
      const filters = parseAuditLogsFilters(req);
      res.json({ success: true, data: await getAuditLogs(filters) });
    } catch (error) {
      next(error);
    }
  };

  v1RouterAdapter.get(
    '/api/admin/audit-logs',
    requireBackendAuth,
    validateQuery(AdminAuditLogsQuerySchema),
    auditLogsHandler
  );

  app.use('/api', limiters.global);

  registerAdminRoutes(v1RouterAdapter as unknown as Express, requireBackendAuth, limiters.global);

  registerProgressRoutes(v1RouterAdapter as unknown as Express);
  registerReadingRoutes(v1RouterAdapter as unknown as Express, requireBackendAuth);
  registerWritingRoutes(v1RouterAdapter as unknown as Express, requireBackendAuth);
  registerListeningRoutes(v1RouterAdapter as unknown as Express, requireBackendAuth);
  registerSpeakingRoutes(v1RouterAdapter as unknown as Express, requireBackendAuth);
  // Serves audio uploaded via POST /api/speaking/audio-upload. Scoped to
  // this one directory only, never the whole filesystem.
  app.use('/uploads/speaking', express.static(path.resolve(process.cwd(), 'uploads', 'speaking')));
  registerGrammarRoutes(v1RouterAdapter as unknown as Express);
};

const initConnectionPool = (config: BackendConfig) => {
  const poolConfig = getPoolConfig({
    maxConnections: config.environment === 'production' ? 20 : 5,
  });
  logger.info('[Pool] Connection pool initialized', {
    max: poolConfig.maxConnections,
    timeout: poolConfig.connectionTimeoutMs,
  });
};

const initIdempotency = (config: BackendConfig, fetchImpl: typeof fetch) => {
  const storeType = config.rateLimit.storeMode === 'upstash' ? 'redis' : 'memory';
  const store = createIdempotencyStore(
    storeType,
    config as {
      rateLimit?: {
        upstashUrl?: string;
        upstashToken?: string;
        storeTimeoutMs?: number;
      };
    },
    fetchImpl
  );
  setGlobalIdempotencyStore(store);
};

const initSentryIfConfigured = (config: BackendConfig) => {
  if (!config.sentry?.dsn) return;
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    tracesSampleRate: config.sentry.tracesSampleRate,
  });
};

const registerNotFoundAndErrorHandlers = (app: Express, config: BackendConfig) => {
  app.use((_request: Request, _response: Response, next: NextFunction) => {
    next(new ApiError(404, 'route_not_found', 'Route not found.'));
  });
  app.use(handleApiError(config));
};

export const createApp = ({
  config,
  fetchImpl = fetch,
  stripeClient = createStripeClient(config!.stripe),
  billingRepository,
  workspaceRepository,
  rateLimitStore = createRateLimitStore(config!.rateLimit, fetchImpl),
}: CreateAppOpts = {}) => {
  if (!config) throw new Error('Backend config is required.');

  initRedisCache(
    config.rateLimit?.upstashUrl ?? undefined,
    config.rateLimit?.upstashToken ?? undefined
  );
  initConnectionPool(config);
  initAuditLog(config as unknown as { workspace?: Record<string, unknown> });
  initIdempotency(config, fetchImpl);
  initSentryIfConfigured(config);

  const app = express();
  setupMiddleware(app, config);
  registerRoutes(
    app,
    config,
    fetchImpl,
    stripeClient,
    billingRepository,
    workspaceRepository,
    rateLimitStore
  );
  registerNotFoundAndErrorHandlers(app, config);

  return app;
};
