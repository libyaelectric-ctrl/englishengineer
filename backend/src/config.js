const SUPPORTED_AI_PROVIDERS = new Set(['mock', 'openai', 'anthropic']);

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const createBackendConfig = (environment = process.env) => {
  const requestedProvider = (environment.AI_PROVIDER || 'mock').toLowerCase();
  const aiProvider = SUPPORTED_AI_PROVIDERS.has(requestedProvider)
    ? requestedProvider
    : 'mock';
  const providerKey =
    aiProvider === 'openai'
      ? environment.OPENAI_API_KEY
      : aiProvider === 'anthropic'
        ? environment.ANTHROPIC_API_KEY
        : null;
  const aiConfigured = aiProvider !== 'mock' && hasText(providerKey);
  const stripeConfigured = [
    environment.STRIPE_SECRET_KEY,
    environment.STRIPE_PRICE_PRO_MONTHLY,
  ].every(hasText);
  const supabaseConfigured = [
    environment.SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
  ].every(hasText);
  const supabaseAuthConfigured =
    hasText(environment.SUPABASE_URL) &&
    (hasText(environment.SUPABASE_ANON_KEY) ||
      hasText(environment.SUPABASE_SERVICE_ROLE_KEY));

  const runtimeEnvironment = [
    'development',
    'test',
    'staging',
    'production',
  ].includes(environment.NODE_ENV)
    ? environment.NODE_ENV
    : 'development';
  const allowInsecureDevAuth =
    runtimeEnvironment === 'test' ||
    String(environment.ALLOW_INSECURE_DEV_AUTH).toLowerCase() === 'true';
  const requestedBillingRepository = (
    environment.BILLING_REPOSITORY ||
    (runtimeEnvironment === 'production' && supabaseConfigured
      ? 'supabase'
      : 'memory')
  ).toLowerCase();
  if (!['memory', 'supabase'].includes(requestedBillingRepository)) {
    throw new Error('BILLING_REPOSITORY must be memory or supabase.');
  }
  const upstashRateLimitConfigured = [
    environment.UPSTASH_REDIS_REST_URL,
    environment.UPSTASH_REDIS_REST_TOKEN,
  ].every(hasText);
  const requestedRateLimitStore = (
    environment.RATE_LIMIT_STORE ||
    (runtimeEnvironment === 'production' ? 'upstash' : 'memory')
  ).toLowerCase();
  if (!['memory', 'upstash'].includes(requestedRateLimitStore)) {
    throw new Error('RATE_LIMIT_STORE must be memory or upstash.');
  }
  const allowInMemoryRateLimitInProduction =
    String(
      environment.ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION
    ).toLowerCase() === 'true';
  if (
    runtimeEnvironment === 'production' &&
    requestedRateLimitStore === 'memory' &&
    !allowInMemoryRateLimitInProduction
  ) {
    throw new Error(
      'Production rate limiting requires RATE_LIMIT_STORE=upstash. Set ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION=true only as a deliberate temporary exception.'
    );
  }
  if (requestedRateLimitStore === 'upstash' && !upstashRateLimitConfigured) {
    throw new Error(
      'RATE_LIMIT_STORE=upstash requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
    );
  }

  if (
    aiProvider !== 'mock' &&
    ((!hasText(environment.AI_MODEL) && aiProvider === 'anthropic') ||
      (Object.prototype.hasOwnProperty.call(environment, 'AI_MODEL') &&
        !hasText(environment.AI_MODEL)))
  ) {
    throw new Error(
      'AI_MODEL must not be empty when a real AI provider is selected.'
    );
  }

  return {
    port: toPositiveInteger(environment.PORT, 8787),
    appOrigin: environment.APP_ORIGIN || 'http://localhost:5173',
    environment: runtimeEnvironment,
    version: environment.APP_VERSION || '4.0.1',
    ai: {
      provider: aiProvider,
      model:
        environment.AI_MODEL?.trim() ||
        (aiProvider === 'openai' ? 'gpt-4.1-mini' : 'mock'),
      timeoutMs: toPositiveInteger(environment.AI_TIMEOUT_MS, 20_000),
      configured: aiConfigured,
      apiKey: aiConfigured ? providerKey.trim() : null,
      rateLimitWindowMs: toPositiveInteger(
        environment.AI_RATE_LIMIT_WINDOW_MS,
        900_000
      ),
      rateLimitMax: toPositiveInteger(environment.AI_RATE_LIMIT_MAX, 30),
    },
    auth: {
      internalApiSecret: hasText(environment.ENGINEEROS_INTERNAL_API_SECRET)
        ? environment.ENGINEEROS_INTERNAL_API_SECRET.trim()
        : null,
      allowInsecureDevAuth,
      supabaseUrl: supabaseAuthConfigured
        ? environment.SUPABASE_URL.trim()
        : null,
      supabaseAnonKey: supabaseAuthConfigured
        ? (
            environment.SUPABASE_ANON_KEY ||
            environment.SUPABASE_SERVICE_ROLE_KEY
          ).trim()
        : null,
    },
    stripe: {
      configured: stripeConfigured,
      secretKey: stripeConfigured ? environment.STRIPE_SECRET_KEY.trim() : null,
      webhookSecret: hasText(environment.STRIPE_WEBHOOK_SECRET)
        ? environment.STRIPE_WEBHOOK_SECRET.trim()
        : null,
      priceProMonthly: stripeConfigured
        ? environment.STRIPE_PRICE_PRO_MONTHLY.trim()
        : null,
      priceProjectMonthly: hasText(environment.STRIPE_PRICE_PROJECT_MONTHLY)
        ? environment.STRIPE_PRICE_PROJECT_MONTHLY.trim()
        : null,
      priceMaxMonthly: hasText(environment.STRIPE_PRICE_MAX_MONTHLY)
        ? environment.STRIPE_PRICE_MAX_MONTHLY.trim()
        : null,
      priceExecMonthly: hasText(environment.STRIPE_PRICE_EXEC_MONTHLY)
        ? environment.STRIPE_PRICE_EXEC_MONTHLY.trim()
        : null,
      pricePrivateMonthly: hasText(environment.STRIPE_PRICE_PRIVATE_MONTHLY)
        ? environment.STRIPE_PRICE_PRIVATE_MONTHLY.trim()
        : null,
      priceTeamMonthly: hasText(environment.STRIPE_PRICE_TEAM_MONTHLY)
        ? environment.STRIPE_PRICE_TEAM_MONTHLY.trim()
        : null,
      environment: runtimeEnvironment,
      allowMemoryRepository:
        runtimeEnvironment !== 'production' ||
        String(environment.ALLOW_MEMORY_BILLING_REPOSITORY).toLowerCase() ===
          'true',
      eventCacheTtlMs: toPositiveInteger(
        environment.STRIPE_EVENT_CACHE_TTL_MS,
        86_400_000
      ),
      eventCacheMax: toPositiveInteger(
        environment.STRIPE_EVENT_CACHE_MAX,
        5_000
      ),
      repositoryMode: requestedBillingRepository,
      supabaseUrl: supabaseConfigured ? environment.SUPABASE_URL.trim() : null,
      supabaseServiceRoleKey: supabaseConfigured
        ? environment.SUPABASE_SERVICE_ROLE_KEY.trim()
        : null,
    },
    supabase: {
      configured: supabaseConfigured,
    },
    vocabulary: {
      timeoutMs: toPositiveInteger(
        environment.VOCABULARY_LOOKUP_TIMEOUT_MS,
        8_000
      ),
      libreTranslateUrl: hasText(environment.LIBRETRANSLATE_URL)
        ? environment.LIBRETRANSLATE_URL.trim()
        : null,
      libreTranslateApiKey: hasText(environment.LIBRETRANSLATE_API_KEY)
        ? environment.LIBRETRANSLATE_API_KEY.trim()
        : null,
      myMemoryEnabled:
        String(environment.MYMEMORY_ENABLED).toLowerCase() === 'true',
      rateLimitWindowMs: toPositiveInteger(
        environment.RATE_LIMIT_WINDOW_MS,
        900_000
      ),
      rateLimitMax: toPositiveInteger(
        environment.VOCABULARY_LOOKUP_RATE_LIMIT_MAX,
        60
      ),
    },
    workspace: {
      configured: supabaseConfigured,
      supabaseUrl: supabaseConfigured
        ? environment.SUPABASE_URL.trim()
        : null,
      supabaseServiceRoleKey: supabaseConfigured
        ? environment.SUPABASE_SERVICE_ROLE_KEY.trim()
        : null,
    },
    rateLimit: {
      windowMs: toPositiveInteger(environment.RATE_LIMIT_WINDOW_MS, 900_000),
      max: toPositiveInteger(environment.RATE_LIMIT_MAX, 100),
      storeMode: requestedRateLimitStore,
      allowInMemoryInProduction: allowInMemoryRateLimitInProduction,
      upstashUrl: upstashRateLimitConfigured
        ? environment.UPSTASH_REDIS_REST_URL.trim().replace(/\/$/, '')
        : null,
      upstashToken: upstashRateLimitConfigured
        ? environment.UPSTASH_REDIS_REST_TOKEN.trim()
        : null,
      storeTimeoutMs: toPositiveInteger(
        environment.RATE_LIMIT_STORE_TIMEOUT_MS,
        3_000
      ),
    },
  };
};

export const toPublicHealth = (config) => ({
  ok: true,
  version: config.version,
  environment: config.environment,
  aiConfigured: config.ai.configured,
  stripeConfigured: config.stripe.configured,
  supabaseConfigured: config.supabase.configured,
  mockMode: !config.ai.configured,
});
