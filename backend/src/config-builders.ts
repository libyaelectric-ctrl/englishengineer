import type {
  AiConfig,
  AuthConfig,
  BillingConfig,
  BillingProviderName,
  BillingRepositoryMode,
  DodoConfig,
  RateLimitConfig,
  RateLimitStoreMode,
  RuntimeEnvironment,
  StripeConfig,
  VocabularyConfig,
  WorkspaceConfig,
} from '../types.js';
import {
  hasText,
  isTrue,
  resolveProviderKey,
  stripWhitespace,
  toPositiveInteger,
  trimEnv,
} from './config-helpers.js';
import { logger } from './logger.js';

const SUPPORTED_AI_PROVIDERS = new Set<string>(['mock', 'openai', 'anthropic', 'gemini']);

type Env = Record<string, string | undefined>;

export const resolveEnvironment = (env: Env): RuntimeEnvironment => {
  const valid: RuntimeEnvironment[] = ['development', 'test', 'staging', 'production'];
  return valid.includes(env.NODE_ENV as RuntimeEnvironment)
    ? (env.NODE_ENV as RuntimeEnvironment)
    : 'development';
};

const validateModelConfig = (configured: boolean, provider: string, env: Env): void => {
  if (configured && env.AI_MODEL !== undefined && !hasText(env.AI_MODEL)) {
    throw new Error('AI_MODEL must not be empty when a real AI provider is selected.');
  }
  if (configured && provider === 'anthropic' && !hasText(env.AI_MODEL)) {
    throw new Error('AI_MODEL must not be empty when a real AI provider is selected.');
  }
};

const getFallbackModel = (env: Env, provider: string): string => {
  const models: Record<string, string> = {
    gemini: 'gemini-2.0-flash',
    openai: 'gpt-4.1-mini',
  };
  return env.AI_MODEL?.trim() || models[provider] || 'mock';
};

export const resolveAI = (env: Env): AiConfig => {
  const requested = (env.AI_PROVIDER || 'mock').toLowerCase();
  const provider = SUPPORTED_AI_PROVIDERS.has(requested)
    ? (requested as AiConfig['provider'])
    : 'mock';
  const key = resolveProviderKey(provider, env);
  const configured = provider !== 'mock' && hasText(key);

  validateModelConfig(configured, provider, env);

  return {
    provider,
    model: getFallbackModel(env, provider),
    timeoutMs: toPositiveInteger(env.AI_TIMEOUT_MS, 20_000),
    configured,
    apiKey: configured ? key!.trim() : null,
    rateLimitWindowMs: toPositiveInteger(env.AI_RATE_LIMIT_WINDOW_MS, 900_000),
    rateLimitMax: toPositiveInteger(env.AI_RATE_LIMIT_MAX, 30),
  };
};

export const resolveAuth = (env: Env, runtimeEnv: RuntimeEnvironment): AuthConfig => {
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
    supabaseUrl: supabaseAuthConfigured ? env.SUPABASE_URL!.trim() : null,
    supabaseAnonKey: supabaseAuthConfigured
      ? (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY)!.replace(/\s+/g, '')
      : null,
    supabaseJwtSecret: stripWhitespace(env.SUPABASE_JWT_SECRET),
    clerkIssuer: stripWhitespace(env.CLERK_ISSUER),
  };
};

export const resolveBilling = (env: Env): BillingConfig => {
  const requested = (env.BILLING_PROVIDER || 'stripe').toLowerCase();
  if (!['stripe', 'dodo', 'paddle'].includes(requested)) {
    throw new Error('BILLING_PROVIDER must be stripe, dodo, or paddle.');
  }
  return { provider: requested as BillingProviderName };
};

export const resolveDodo = (env: Env): DodoConfig => {
  const apiKey = stripWhitespace(env.DODO_PAYMENTS_API_KEY);
  const webhookSecret = stripWhitespace(env.DODO_PAYMENTS_WEBHOOK_KEY);
  const environment = env.DODO_PAYMENTS_ENVIRONMENT === 'test' ? 'test' : 'live';
  const baseUrl =
    environment === 'test' ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com';
  const configured = hasText(apiKey) && hasText(env.DODO_PRODUCT_JUNIOR_MONTHLY);

  return {
    configured,
    apiKey: configured ? apiKey : null,
    webhookSecret: webhookSecret || null,
    baseUrl: configured ? baseUrl : null,
    environment,
    productJuniorMonthly: trimEnv(env.DODO_PRODUCT_JUNIOR_MONTHLY),
    productSeniorMonthly: trimEnv(env.DODO_PRODUCT_SENIOR_MONTHLY),
    productSpecialistMonthly: trimEnv(env.DODO_PRODUCT_SPECIALIST_MONTHLY),
    productMasterMonthly: trimEnv(env.DODO_PRODUCT_MASTER_MONTHLY),
    productTeamMonthly: trimEnv(env.DODO_PRODUCT_TEAM_MONTHLY),
    productJuniorAnnual: trimEnv(env.DODO_PRODUCT_JUNIOR_ANNUAL),
    productSeniorAnnual: trimEnv(env.DODO_PRODUCT_SENIOR_ANNUAL),
    productSpecialistAnnual: trimEnv(env.DODO_PRODUCT_SPECIALIST_ANNUAL),
    productMasterAnnual: trimEnv(env.DODO_PRODUCT_MASTER_ANNUAL),
    productTeamAnnual: trimEnv(env.DODO_PRODUCT_TEAM_ANNUAL),
    productTopup: trimEnv(env.DODO_PRODUCT_TOPUP),
    eventCacheTtlMs: toPositiveInteger(env.DODO_EVENT_CACHE_TTL_MS, 86_400_000),
    eventCacheMax: toPositiveInteger(env.DODO_EVENT_CACHE_MAX, 5_000),
  };
};

export const resolveStripe = (env: Env, runtimeEnv: RuntimeEnvironment): StripeConfig => {
  const juniorPrice = trimEnv(env.STRIPE_PRICE_JUNIOR_MONTHLY);
  const hasPrice = hasText(juniorPrice);
  const configured = hasText(env.STRIPE_SECRET_KEY) && hasPrice;
  const supabaseConfigured = [env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY].every(hasText);

  const requestedBillingRepository = (
    env.BILLING_REPOSITORY ||
    (runtimeEnv === 'production' && supabaseConfigured ? 'supabase' : 'memory')
  ).toLowerCase();
  if (!['memory', 'supabase'].includes(requestedBillingRepository)) {
    throw new Error('BILLING_REPOSITORY must be memory or supabase.');
  }

  return {
    configured,
    secretKey: configured ? env.STRIPE_SECRET_KEY!.replace(/\s+/g, '') : null,
    webhookSecret: stripWhitespace(env.STRIPE_WEBHOOK_SECRET),
    priceJuniorMonthly: juniorPrice,
    priceSeniorMonthly: trimEnv(env.STRIPE_PRICE_SENIOR_MONTHLY),
    priceSpecialistMonthly: trimEnv(env.STRIPE_PRICE_SPECIALIST_MONTHLY),
    priceMasterMonthly: trimEnv(env.STRIPE_PRICE_MASTER_MONTHLY),
    priceTeamMonthly: trimEnv(env.STRIPE_PRICE_TEAM_MONTHLY),
    priceJuniorAnnual: trimEnv(env.STRIPE_PRICE_JUNIOR_ANNUAL),
    priceSeniorAnnual: trimEnv(env.STRIPE_PRICE_SENIOR_ANNUAL),
    priceSpecialistAnnual: trimEnv(env.STRIPE_PRICE_SPECIALIST_ANNUAL),
    priceMasterAnnual: trimEnv(env.STRIPE_PRICE_MASTER_ANNUAL),
    priceTeamAnnual: trimEnv(env.STRIPE_PRICE_TEAM_ANNUAL),
    environment: runtimeEnv,
    allowMemoryRepository:
      runtimeEnv !== 'production' || isTrue(env.ALLOW_MEMORY_BILLING_REPOSITORY),
    eventCacheTtlMs: toPositiveInteger(env.STRIPE_EVENT_CACHE_TTL_MS, 86_400_000),
    eventCacheMax: toPositiveInteger(env.STRIPE_EVENT_CACHE_MAX, 5_000),
    repositoryMode: requestedBillingRepository as BillingRepositoryMode,
    supabaseUrl: supabaseConfigured ? env.SUPABASE_URL!.trim() : null,
    supabaseServiceRoleKey: supabaseConfigured
      ? env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
      : null,
  };
};

const validateRateLimitStore = (
  requested: string,
  upstashConfigured: boolean,
  runtimeEnv: RuntimeEnvironment,
  allowInMemory: boolean
) => {
  if (!['memory', 'upstash'].includes(requested))
    throw new Error('RATE_LIMIT_STORE must be memory or upstash.');
  if (runtimeEnv === 'production' && requested === 'memory' && !allowInMemory)
    logger.warn('Production rate limiting requires RATE_LIMIT_STORE=upstash');
  if (requested === 'upstash' && !upstashConfigured)
    throw new Error(
      'RATE_LIMIT_STORE=upstash requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
    );
};

export const resolveRateLimit = (env: Env, runtimeEnv: RuntimeEnvironment): RateLimitConfig => {
  const upstashConfigured = [env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN].every(
    hasText
  );
  const requested = (
    env.RATE_LIMIT_STORE ?? (runtimeEnv === 'production' ? 'upstash' : 'memory')
  ).toLowerCase();
  const allowInMemory = isTrue(env.ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION);
  validateRateLimitStore(requested, upstashConfigured, runtimeEnv, allowInMemory);

  const upstashUrl = upstashConfigured
    ? env.UPSTASH_REDIS_REST_URL!.trim().replace(/\/$/, '')
    : null;
  const upstashToken = upstashConfigured ? env.UPSTASH_REDIS_REST_TOKEN!.replace(/\s+/g, '') : null;
  return {
    windowMs: toPositiveInteger(env.RATE_LIMIT_WINDOW_MS, 900_000),
    max: toPositiveInteger(env.RATE_LIMIT_MAX, 100),
    storeMode: requested as RateLimitStoreMode,
    allowInMemoryInProduction: allowInMemory,
    upstashUrl,
    upstashToken,
    storeTimeoutMs: toPositiveInteger(env.RATE_LIMIT_STORE_TIMEOUT_MS, 3_000),
  };
};

export const resolveVocabulary = (env: Env): VocabularyConfig => ({
  timeoutMs: toPositiveInteger(env.VOCABULARY_LOOKUP_TIMEOUT_MS, 8_000),
  libreTranslateUrl: trimEnv(env.LIBRETRANSLATE_URL),
  libreTranslateApiKey: trimEnv(env.LIBRETRANSLATE_API_KEY),
  myMemoryEnabled: isTrue(env.MYMEMORY_ENABLED),
  rateLimitWindowMs: toPositiveInteger(env.RATE_LIMIT_WINDOW_MS, 900_000),
  rateLimitMax: toPositiveInteger(env.VOCABULARY_LOOKUP_RATE_LIMIT_MAX, 60),
});

export const resolveSupabase = (env: Env): { configured: boolean } => ({
  configured: [env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY].every(hasText),
});

export const resolveWorkspace = (env: Env): WorkspaceConfig => {
  const configured = [env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY].every(hasText);
  return {
    configured,
    supabaseUrl: configured ? env.SUPABASE_URL!.trim() : null,
    supabaseServiceRoleKey: configured ? env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '') : null,
  };
};
