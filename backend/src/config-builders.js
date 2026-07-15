import {
  hasText,
  toPositiveInteger,
  trimEnv,
  stripWhitespace,
  isTrue,
  resolveProviderKey,
} from './config-helpers.js';

const SUPPORTED_AI_PROVIDERS = new Set(['mock', 'openai', 'anthropic', 'gemini']);

export const resolveEnvironment = (env) => {
  const valid = ['development', 'test', 'staging', 'production'];
  return valid.includes(env.NODE_ENV) ? env.NODE_ENV : 'development';
};

export const resolveAI = (env) => {
  const requested = (env.AI_PROVIDER || 'mock').toLowerCase();
  const provider = SUPPORTED_AI_PROVIDERS.has(requested) ? requested : 'mock';
  const key = resolveProviderKey(provider, env);
  const configured = provider !== 'mock' && hasText(key);

  if (
    provider !== 'mock' &&
    ((!hasText(env.AI_MODEL) && provider === 'anthropic') ||
      (Object.prototype.hasOwnProperty.call(env, 'AI_MODEL') && !hasText(env.AI_MODEL)))
  ) {
    throw new Error('AI_MODEL must not be empty when a real AI provider is selected.');
  }

  return {
    provider,
    model:
      env.AI_MODEL?.trim() ||
      (provider === 'gemini' ? 'gemini-2.0-flash' : provider === 'openai' ? 'gpt-4.1-mini' : 'mock'),
    timeoutMs: toPositiveInteger(env.AI_TIMEOUT_MS, 20_000),
    configured,
    apiKey: configured ? key.trim() : null,
    rateLimitWindowMs: toPositiveInteger(env.AI_RATE_LIMIT_WINDOW_MS, 900_000),
    rateLimitMax: toPositiveInteger(env.AI_RATE_LIMIT_MAX, 30),
  };
};

export const resolveAuth = (env, runtimeEnv) => {
  const supabaseAuthConfigured =
    hasText(env.SUPABASE_URL) &&
    (hasText(env.SUPABASE_ANON_KEY) || hasText(env.SUPABASE_SERVICE_ROLE_KEY));

  const allowInsecureDevAuth =
    runtimeEnv === 'production'
      ? false
      : runtimeEnv === 'test' || isTrue(env.ALLOW_INSECURE_DEV_AUTH);

  if (runtimeEnv === 'production' && isTrue(env.ALLOW_INSECURE_DEV_AUTH)) {
    throw new Error(
      'ALLOW_INSECURE_DEV_AUTH must not be true in production. ' +
      'Set ALLOW_INSECURE_DEV_AUTH=false or remove it from your environment.'
    );
  }

  return {
    internalApiSecret: trimEnv(env.ENGINEEROS_INTERNAL_API_SECRET),
    allowInsecureDevAuth,
    supabaseUrl: supabaseAuthConfigured ? env.SUPABASE_URL.trim() : null,
    supabaseAnonKey: supabaseAuthConfigured
      ? (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY).replace(/\s+/g, '')
      : null,
    supabaseJwtSecret: stripWhitespace(env.SUPABASE_JWT_SECRET),
  };
};

export const resolveStripe = (env, runtimeEnv) => {
  const configured = [env.STRIPE_SECRET_KEY, env.STRIPE_PRICE_PRO_MONTHLY].every(hasText);
  const supabaseConfigured = [env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY].every(hasText);

  const requestedBillingRepository = (
    env.BILLING_REPOSITORY || (runtimeEnv === 'production' && supabaseConfigured ? 'supabase' : 'memory')
  ).toLowerCase();
  if (!['memory', 'supabase'].includes(requestedBillingRepository)) {
    throw new Error('BILLING_REPOSITORY must be memory or supabase.');
  }

  return {
    configured,
    secretKey: configured ? env.STRIPE_SECRET_KEY.replace(/\s+/g, '') : null,
    webhookSecret: stripWhitespace(env.STRIPE_WEBHOOK_SECRET),
    priceProMonthly: configured ? env.STRIPE_PRICE_PRO_MONTHLY.trim() : null,
    priceProjectMonthly: trimEnv(env.STRIPE_PRICE_PROJECT_MONTHLY),
    priceMaxMonthly: trimEnv(env.STRIPE_PRICE_MAX_MONTHLY),
    priceExecMonthly: trimEnv(env.STRIPE_PRICE_EXEC_MONTHLY),
    pricePrivateMonthly: trimEnv(env.STRIPE_PRICE_PRIVATE_MONTHLY),
    priceTeamMonthly: trimEnv(env.STRIPE_PRICE_TEAM_MONTHLY),
    environment: runtimeEnv,
    allowMemoryRepository: runtimeEnv !== 'production' || isTrue(env.ALLOW_MEMORY_BILLING_REPOSITORY),
    eventCacheTtlMs: toPositiveInteger(env.STRIPE_EVENT_CACHE_TTL_MS, 86_400_000),
    eventCacheMax: toPositiveInteger(env.STRIPE_EVENT_CACHE_MAX, 5_000),
    repositoryMode: requestedBillingRepository,
    supabaseUrl: supabaseConfigured ? env.SUPABASE_URL.trim() : null,
    supabaseServiceRoleKey: supabaseConfigured ? env.SUPABASE_SERVICE_ROLE_KEY.replace(/\s+/g, '') : null,
  };
};

export const resolveRateLimit = (env, runtimeEnv) => {
  const upstashConfigured = [env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN].every(hasText);

  const requested = (env.RATE_LIMIT_STORE || (runtimeEnv === 'production' ? 'upstash' : 'memory')).toLowerCase();
  if (!['memory', 'upstash'].includes(requested)) {
    throw new Error('RATE_LIMIT_STORE must be memory or upstash.');
  }

  const allowInMemory = isTrue(env.ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION);
  if (runtimeEnv === 'production' && requested === 'memory' && !allowInMemory) {
    console.warn('WARNING: Production rate limiting requires RATE_LIMIT_STORE=upstash.');
  }
  if (requested === 'upstash' && !upstashConfigured) {
    throw new Error('RATE_LIMIT_STORE=upstash requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
  }

  return {
    windowMs: toPositiveInteger(env.RATE_LIMIT_WINDOW_MS, 900_000),
    max: toPositiveInteger(env.RATE_LIMIT_MAX, 100),
    storeMode: requested,
    allowInMemoryInProduction: allowInMemory,
    upstashUrl: upstashConfigured ? env.UPSTASH_REDIS_REST_URL.trim().replace(/\/$/, '') : null,
    upstashToken: upstashConfigured ? env.UPSTASH_REDIS_REST_TOKEN.replace(/\s+/g, '') : null,
    storeTimeoutMs: toPositiveInteger(env.RATE_LIMIT_STORE_TIMEOUT_MS, 3_000),
  };
};

export const resolveVocabulary = (env) => ({
  timeoutMs: toPositiveInteger(env.VOCABULARY_LOOKUP_TIMEOUT_MS, 8_000),
  libreTranslateUrl: trimEnv(env.LIBRETRANSLATE_URL),
  libreTranslateApiKey: trimEnv(env.LIBRETRANSLATE_API_KEY),
  myMemoryEnabled: isTrue(env.MYMEMORY_ENABLED),
  rateLimitWindowMs: toPositiveInteger(env.RATE_LIMIT_WINDOW_MS, 900_000),
  rateLimitMax: toPositiveInteger(env.VOCABULARY_LOOKUP_RATE_LIMIT_MAX, 60),
});

export const resolveSupabase = (env) => ({
  configured: [env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY].every(hasText),
});

export const resolveWorkspace = (env) => {
  const configured = [env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY].every(hasText);
  return {
    configured,
    supabaseUrl: configured ? env.SUPABASE_URL.trim() : null,
    supabaseServiceRoleKey: configured ? env.SUPABASE_SERVICE_ROLE_KEY.replace(/\s+/g, '') : null,
  };
};
