import * as Sentry from '@sentry/node';
import compression from 'compression';
import cors from 'cors';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import helmet from 'helmet';
import { createRequire } from 'node:module';
import path from 'node:path';
import type Stripe from 'stripe';

import type { BackendConfig } from '../types.js';
import { registerAdminRoutes } from './admin-routes.js';
import { createAIService, registerAIRoutes } from './ai.js';
import { recordEndpoint } from './api-metrics.js';
import { initAuditLog } from './audit-log.js';
import { createBackendAuth } from './auth.js';
import type { BackendAuthConfig } from './auth.js';
import { registerBillingRoutes } from './billing-routes.js';
import { createBillingService, createStripeClient } from './billing-service.js';
import type { BillingServiceConfig } from './billing-service.js';
import { getPoolConfig, getPoolMetrics, startPoolHealthCheck } from './cache/connection-pool.js';
import { initRedisCache } from './cache/redis-cache.service.js';
import { toPublicHealth } from './config.js';
import { ApiError, toErrorResponse } from './errors.js';
import { registerExportRoutes } from './export-routes.js';
import { registerGrammarRoutes } from './grammar-routes.js';
import { createI18nMiddleware } from './i18n.js';
import { registerListeningRoutes } from './listening-routes.js';
import { logger } from './logger.js';
import { correlationId } from './middleware/correlation.middleware.js';
import { csrfProtection } from './middleware/csrf.middleware.js';
import {
  createIdempotencyStore,
  setGlobalIdempotencyStore,
} from './middleware/idempotency.middleware.js';
import { inputSanitization } from './middleware/sanitize.middleware.js';
import { requireTenantContext } from './middleware/tenant.middleware.js';
import { recordRequest } from './performance-monitor.js';
import { registerProgressRoutes } from './progress-routes.js';
import { getPrometheusMetrics } from './prometheus.js';
import { createRateLimitStore, createRateLimiter } from './rate-limit.js';
import type { UpstashRateLimitStore } from './rate-limit.js';
import { registerReadingRoutes } from './reading-routes.js';
import { registerSpeakingRoutes } from './speaking-routes.js';
import type { SubscriptionRepository } from './subscription-repository.js';
import { createSubscriptionRepository } from './subscription-repository.js';
import { swaggerSpec } from './swagger.js';
import { registerTeamAnalyticsRoutes } from './team-analytics.js';
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
      connectSrc: ["'self'"],
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

  if (!config.auth.clerkIssuer) {
    if (config.environment === 'production' && process.env.NODE_ENV !== 'test') {
      throw new Error(
        'CLERK_ISSUER is required in production. Refusing to start: without it, every ' +
          'Clerk-authenticated request will silently fail with 401. Set CLERK_ISSUER to the ' +
          "exact value of your Clerk instance's issuer (e.g. https://clerk.<your-domain>.com), " +
          'no trailing slash.'
      );
    }
    logger.warn(
      'CLERK_ISSUER is not set. Clerk-authenticated requests will fail in this environment.'
    );
  }

  app.disable('x-powered-by');

  // Response compression — gzip for all responses > 1KB
  app.use(
    compression({
      threshold: 1024,
      level: 6, // balanced speed/ratio
      filter: (req, res) => {
        // Don't compress webhook raw body responses
        if (req.path.includes('/webhooks/')) return false;
        return compression.filter(req, res);
      },
    })
  );

  SECURITY_HEADERS.contentSecurityPolicy.directives.connectSrc = [
    "'self'",
    config.appOrigin,
    'https://sentry.io',
  ];
  app.use(helmet(SECURITY_HEADERS as Parameters<typeof helmet>[0]));

  const configuredOrigins = [config.appOrigin, ...(config.corsAllowedOrigins || [])].filter(
    Boolean
  ) as string[];

  // Automatically allow the www./non-www. counterpart of every configured
  // origin, so a domain migration only requires updating APP_ORIGIN (and/or
  // CORS_ALLOWED_ORIGINS) — no code change or redeploy-of-a-hardcoded-list
  // is needed. This is what actually caused a production outage previously:
  // the origin was migrated but the old hardcoded fallback here still only
  // matched the old domain.
  const withWwwVariants = configuredOrigins.flatMap((origin) => {
    try {
      const url = new URL(origin);
      const alt = url.hostname.startsWith('www.')
        ? `${url.protocol}//${url.hostname.slice(4)}${url.port ? `:${url.port}` : ''}`
        : `${url.protocol}//www.${url.hostname}${url.port ? `:${url.port}` : ''}`;
      return [origin, alt];
    } catch {
      return [origin];
    }
  });

  const allowedOrigins = [...new Set(withWwwVariants)].filter(Boolean) as string[];

  if (config.environment === 'production') {
    // Force HTTPS for all non-GET requests
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.headers['x-forwarded-proto'] !== 'https' && req.method !== 'GET') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
    // Remove unnecessary headers in production
    app.use((_req: Request, res: Response, next: NextFunction) => {
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');
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
        else callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: [
        'Authorization',
        'Content-Type',
        'Stripe-Signature',
        'Webhook-Signature',
        'Webhook-Id',
        'Webhook-Timestamp',
        'X-EngineerOS-AI-Contract',
        'X-EngineerOS-Request-Id',
        'X-EngineerOS-User-Id',
        'X-EngineerOS-User-Email',
        'X-EngineerOS-Org-Id',
        'X-Corporation-Id',
        'X-EngVox-User-Id',
        'X-EngVox-AI-Contract',
        'X-EngVox-Request-Id',
        'X-CSRF-Token',
        'x-request-id',
      ],
    })
  );

  // Explicit 403 for disallowed origins: cors() with callback(null, false) just
  // omits the CORS headers; this gives non-browser callers a clear, shaped error.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
      return next(new ApiError(403, 'origin_not_allowed', 'Origin not allowed by CORS.'));
    }
    return next();
  });

  const webhookRawRouter = express.Router();
  for (const webhookPath of ['/api/webhooks/stripe', '/api/webhooks/dodo']) {
    webhookRawRouter.post(
      webhookPath,
      express.raw({ type: 'application/json', limit: '1mb' }),
      (_req: Request, _res: Response, next: NextFunction) => next()
    );
  }
  app.use(webhookRawRouter);
  app.use(express.json({ limit: '256kb' }));
  app.use(correlationId);
  app.use(inputSanitization);
  app.use(csrfProtection);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    res.on('finish', () => {
      const diff = process.hrtime(start);
      const timeMs = parseFloat((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
      const isError = res.statusCode >= 400;
      recordRequest(timeMs, isError, req.method, req.route?.path || req.originalUrl);
      recordEndpoint(req.method, req.route?.path || req.originalUrl, timeMs, isError);
      logger.info('Timing', {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        timeMs,
        requestId: req.id,
        userId: req.auth?.userId,
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
  reading: createRateLimiter({
    windowMs: config.ai.rateLimitWindowMs,
    max: config.ai.rateLimitMax,
    scope: 'reading',
    store: rateLimitStore,
  }),
  writing: createRateLimiter({
    windowMs: config.ai.rateLimitWindowMs,
    max: config.ai.rateLimitMax,
    scope: 'writing',
    store: rateLimitStore,
  }),
  speaking: createRateLimiter({
    windowMs: config.ai.rateLimitWindowMs,
    max: config.ai.rateLimitMax,
    scope: 'speaking',
    store: rateLimitStore,
  }),
  listening: createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    scope: 'listening',
    store: rateLimitStore,
  }),
  grammar: createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    scope: 'grammar',
    store: rateLimitStore,
  }),
  progress: createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    scope: 'progress',
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

  // Global limiter must be mounted BEFORE the versioned router. It used to be
  // registered after every route, so /api/v1 traffic never reached it and the
  // global budget was effectively dead. Machine-to-machine traffic is exempt:
  // payment webhooks, health probes, metrics scraping, CSP reports.
  const globalApiLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max * 2,
    scope: 'global',
    store: rateLimitStore,
  });
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    if (
      req.path.startsWith('/webhooks/') ||
      req.path === '/health' ||
      req.path === '/metrics' ||
      req.path === '/csp-report'
    ) {
      return next();
    }
    return globalApiLimiter(req, res, next);
  });

  app.use('/api/v1', v1Router);

  const adaptPath = (path: string) => {
    if (path.startsWith('/api/')) {
      return path.slice(4);
    }
    return path;
  };

  const v1RouterAdapter = {
    get: (path: string, ...handlers: RequestHandler[]) => {
      v1Router.get(adaptPath(path), ...handlers);
      return v1RouterAdapter;
    },
    post: (path: string, ...handlers: RequestHandler[]) => {
      if (path.startsWith('/api/webhooks/')) {
        // Webhooks intentionally live at /api/webhooks (raw-body parsing and
        // signature verification are wired there); never under /api/v1.
        app.post(path, ...handlers);
        return v1RouterAdapter;
      }
      v1Router.post(adaptPath(path), ...handlers);
      return v1RouterAdapter;
    },
    put: (path: string, ...handlers: RequestHandler[]) => {
      v1Router.put(adaptPath(path), ...handlers);
      return v1RouterAdapter;
    },
    delete: (path: string, ...handlers: RequestHandler[]) => {
      v1Router.delete(adaptPath(path), ...handlers);
      return v1RouterAdapter;
    },
    use: (...args: (string | RequestHandler)[]) => {
      if (typeof args[0] === 'string') {
        const path = args[0];
        const handlers = args.slice(1) as RequestHandler[];
        v1Router.use(adaptPath(path), ...handlers);
      } else {
        v1Router.use(...(args as unknown as RequestHandler[]));
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
    const mem = process.memoryUsage();
    response.json({
      ...health,
      checks,
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString(),
      stripeConfigured: (checks.stripe as { configured?: boolean })?.configured ?? false,
      aiConfigured: config.ai.configured,
      aiModel: config.ai.model ?? 'unknown',
      billingProvider: config.billing.provider ?? 'none',
      memory: {
        heapUsedMB: Math.round(mem.heapUsed / 1048576),
        heapTotalMB: Math.round(mem.heapTotal / 1048576),
        rssMB: Math.round(mem.rss / 1048576),
      },
      pool: getPoolMetrics(),
      uptime: Math.round(process.uptime()),
      nodeVersion: process.version,
    });
  };

  v1Router.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Root route — Render health check hits /
  app.get('/', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'englishengineer-backend', health: '/api/health' });
  });

  // Prometheus metrics endpoint. Internal telemetry: when METRICS_TOKEN is set,
  // require it via Authorization: Bearer <token> or ?token=. Without a token the
  // endpoint stays open for backwards compatibility, but production should set one.
  const metricsToken = process.env.METRICS_TOKEN?.trim() || null;
  app.get('/api/metrics', (req: Request, res: Response, next: NextFunction) => {
    if (metricsToken) {
      const bearer = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7).trim()
        : undefined;
      const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
      if ((bearer ?? queryToken) !== metricsToken) {
        return next(new ApiError(403, 'metrics_forbidden', 'Metrics require a valid token.'));
      }
    }
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.send(getPrometheusMetrics());
  });

  app.get('/api-docs.json', (_req: Request, res: Response) => res.json(swaggerSpec));
  // Self-hosted Swagger UI: assets are served same-origin from
  // /api-docs-assets (no CDN), and the initializer is an external script, so
  // the page works under the global script-src 'self' CSP.
  const nodeRequire = createRequire(import.meta.url);
  const swaggerUiDistPath = path.dirname(nodeRequire.resolve('swagger-ui-dist/package.json'));

  app.get('/api-docs-assets/swagger-initializer.js', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.send(
      [
        'window.onload = function () {',
        '  window.ui = SwaggerUIBundle({',
        "    url: '/api-docs.json',",
        "    dom_id: '#swagger-ui',",
        '    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],',
        "    layout: 'StandaloneLayout',",
        '  });',
        '};',
      ].join('\n')
    );
  });
  app.use('/api-docs-assets', express.static(swaggerUiDistPath));

  app.get('/api-docs', (_req: Request, res: Response) => {
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
      ].join('; ')
    );
    res.send(
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<meta charset="utf-8" />',
        '<title>EngineerOS API Docs</title>',
        '<link rel="stylesheet" href="/api-docs-assets/swagger-ui.css" />',
        '</head>',
        '<body>',
        '<div id="swagger-ui"></div>',
        '<script src="/api-docs-assets/swagger-ui-bundle.js"></script>',
        '<script src="/api-docs-assets/swagger-ui-standalone-preset.js"></script>',
        '<script src="/api-docs-assets/swagger-initializer.js"></script>',
        '</body>',
        '</html>',
      ].join('')
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
    { ...config.auth, environment: config.environment } as BackendAuthConfig,
    fetchImpl
  );
  const { requireBackendAuth, optionalBackendAuth } = backendAuth;
  const limiters = createAllRateLimiters(config, rateLimitStore);

  const aiService = createAIService(config.ai, fetchImpl);

  registerAIRoutes(
    v1RouterAdapter as unknown as Express,
    aiService as unknown as Parameters<typeof registerAIRoutes>[1],
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
    limiters.vocabulary,
    requireBackendAuth
  );

  registerBillingRoutes(
    v1RouterAdapter as unknown as Express,
    createBillingService({
      config: {
        ...config.stripe,
        provider: config.billing.provider,
        dodo: config.dodo,
      } as unknown as BillingServiceConfig,
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
      fetchImpl,
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

  registerAdminRoutes(v1RouterAdapter as unknown as Express, requireBackendAuth, limiters.global);

  registerProgressRoutes(
    v1RouterAdapter as unknown as Express,
    limiters.progress,
    requireBackendAuth
  );
  registerReadingRoutes(
    v1RouterAdapter as unknown as Express,
    requireBackendAuth,
    limiters.reading,
    aiService
  );
  registerWritingRoutes(
    v1RouterAdapter as unknown as Express,
    requireBackendAuth,
    limiters.writing,
    aiService
  );
  registerListeningRoutes(
    v1RouterAdapter as unknown as Express,
    requireBackendAuth,
    limiters.listening
  );
  registerSpeakingRoutes(
    v1RouterAdapter as unknown as Express,
    requireBackendAuth,
    limiters.speaking,
    aiService
  );
  // Serves audio uploaded via POST /api/speaking/audio-upload. Scoped to
  // this one directory only, never the whole filesystem.
  app.use('/uploads/speaking', express.static(path.resolve(process.cwd(), 'uploads', 'speaking')));
  registerGrammarRoutes(
    v1RouterAdapter as unknown as Express,
    requireBackendAuth,
    limiters.grammar
  ); // GDPR data export routes
  registerExportRoutes(
    v1RouterAdapter as unknown as Express,
    requireBackendAuth,
    config as unknown as { workspace?: Record<string, unknown> }
  );

  // Team analytics routes
  registerTeamAnalyticsRoutes(v1RouterAdapter as unknown as Express, requireBackendAuth, limiters.global);
};

const initConnectionPool = (config: BackendConfig) => {
  const poolConfig = getPoolConfig({
    maxConnections: config.environment === 'production' ? 20 : 5,
    minConnections: config.environment === 'production' ? 4 : 1,
  });
  startPoolHealthCheck(poolConfig);
  logger.info('[Pool] Connection pool initialized', {
    max: poolConfig.maxConnections,
    min: poolConfig.minConnections,
    timeout: poolConfig.connectionTimeoutMs,
    healthCheckInterval: poolConfig.healthCheckIntervalMs,
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

