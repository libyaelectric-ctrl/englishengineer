import { logger } from '@/shared/logger';

export interface EngVoxEnv {
  VITE_APP_VERSION?: string;
  VITE_ENVIRONMENT_MODE?: string;
  VITE_AI_PROVIDER?: string;
  VITE_AI_PROXY_URL?: string;
  VITE_AUTH_PROVIDER?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_BILLING_API_URL?: string;
  VITE_ENABLE_MOCK_BILLING?: string;
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  VITE_ERROR_MONITORING_PROVIDER?: string;
  VITE_SENTRY_DSN?: string;
  VITE_ERROR_MONITORING_SAMPLE_RATE?: string;
}

interface ImportMetaWithEngVoxEnv {
  env?: EngVoxEnv;
}

export interface EnvironmentValidationResult {
  isProductionReady: boolean;
  mode: 'local' | 'development' | 'staging' | 'production';
  errors: string[];
  warnings: string[];
  safeConfig: {
    appVersion: string;
    aiProvider: string;
    authProvider: string;
    billingMode: 'backend' | 'local-fallback';
    hasAiProxyUrl: boolean;
    hasSupabaseUrl: boolean;
    hasSupabaseAnonKey: boolean;
    hasBillingApiUrl: boolean;
    hasStripePublishableKey: boolean;
  };
}

const env = (import.meta as unknown as ImportMetaWithEngVoxEnv).env;

export const isConfiguredPublicUrl = (value: string | undefined): boolean => {
  const normalized = value?.trim();
  if (!normalized || /[<>]/.test(normalized)) return false;
  try {
    const url = new URL(normalized);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const hostname = url.hostname.toLowerCase();
    return !(
      hostname === 'example.com' ||
      hostname.endsWith('.example.com') ||
      hostname.startsWith('your-') ||
      hostname.includes('placeholder')
    );
  } catch {
    return false;
  }
};

const normalizeEnvironmentMode = (
  mode: string | undefined
): EnvironmentValidationResult['mode'] => {
  if (
    mode === 'production' ||
    mode === 'staging' ||
    mode === 'development' ||
    mode === 'local'
  ) {
    return mode;
  }

  return 'local';
};

const getUnsafeFrontendEnvKeys = (source: EngVoxEnv | undefined): string[] =>
  Object.keys(source || {}).filter((key) =>
    /SECRET|PRIVATE|SERVICE_ROLE|STRIPE_SECRET|WEBHOOK_SECRET/i.test(key)
  );

const collectEnvironmentWarnings = (
  aiProvider: string,
  hasAiProxyUrl: boolean,
  authProvider: string,
  hasSupabaseUrl: boolean,
  hasSupabaseAnonKey: boolean,
  hasBillingApiUrl: boolean
): string[] => {
  const warnings: string[] = [];
  if (aiProvider === 'backend' && !hasAiProxyUrl) {
    warnings.push(
      'VITE_AI_PROVIDER=backend requires VITE_AI_PROXY_URL. AI will fall back safely.'
    );
  }
  if (authProvider === 'supabase' && (!hasSupabaseUrl || !hasSupabaseAnonKey)) {
    warnings.push(
      'VITE_AUTH_PROVIDER=supabase requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Auth will fall back safely.'
    );
  }
  if (!hasBillingApiUrl) {
    warnings.push(
      'VITE_BILLING_API_URL is missing or a placeholder. Billing remains in Free plan fallback mode.'
    );
  }
  return warnings;
};

const collectEnvironmentErrors = (
  mode: EnvironmentValidationResult['mode'],
  aiProvider: string,
  hasAiProxyUrl: boolean,
  authProvider: string,
  hasSupabaseUrl: boolean,
  hasSupabaseAnonKey: boolean,
  hasBillingApiUrl: boolean,
  appVersion: string,
  unsafeFrontendKeys: string[]
): string[] => {
  const errors: string[] = [];
  if (unsafeFrontendKeys.length > 0) {
    errors.push(
      `Unsafe secret-like frontend env keys detected: ${unsafeFrontendKeys.join(', ')}`
    );
  }
  if (mode !== 'production') return errors;
  if (aiProvider !== 'backend' || !hasAiProxyUrl) {
    errors.push(
      'Production requires VITE_AI_PROVIDER=backend and VITE_AI_PROXY_URL.'
    );
  }
  if (authProvider !== 'supabase' || !hasSupabaseUrl || !hasSupabaseAnonKey) {
    errors.push(
      'Production requires VITE_AUTH_PROVIDER=supabase, VITE_SUPABASE_URL, and VITE_SUPABASE_ANON_KEY.'
    );
  }
  if (!hasBillingApiUrl) {
    errors.push('Production requires VITE_BILLING_API_URL.');
  }
  if (!appVersion) {
    errors.push('Production requires VITE_APP_VERSION.');
  }
  return errors;
};

export const validateEnvironment = (
  source: EngVoxEnv | undefined = env
): EnvironmentValidationResult => {
  const mode = normalizeEnvironmentMode(source?.VITE_ENVIRONMENT_MODE);
  const appVersion = source?.VITE_APP_VERSION || '4.0.1';
  const aiProvider = source?.VITE_AI_PROVIDER || 'mock';
  const authProvider = source?.VITE_AUTH_PROVIDER || 'local';
  const hasAiProxyUrl = isConfiguredPublicUrl(source?.VITE_AI_PROXY_URL);
  const hasSupabaseUrl = isConfiguredPublicUrl(source?.VITE_SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(source?.VITE_SUPABASE_ANON_KEY);
  const hasBillingApiUrl = isConfiguredPublicUrl(source?.VITE_BILLING_API_URL);
  const hasStripePublishableKey = Boolean(source?.VITE_STRIPE_PUBLISHABLE_KEY);
  const billingMode = hasBillingApiUrl ? 'backend' : 'local-fallback';
  const unsafeFrontendKeys = getUnsafeFrontendEnvKeys(source);

  const warnings = collectEnvironmentWarnings(
    aiProvider, hasAiProxyUrl, authProvider, hasSupabaseUrl, hasSupabaseAnonKey, hasBillingApiUrl
  );
  const errors = collectEnvironmentErrors(
    mode, aiProvider, hasAiProxyUrl, authProvider, hasSupabaseUrl, hasSupabaseAnonKey,
    hasBillingApiUrl, appVersion, unsafeFrontendKeys
  );

  return {
    isProductionReady: errors.length === 0 && warnings.length === 0,
    mode,
    errors,
    warnings,
    safeConfig: {
      appVersion,
      aiProvider,
      authProvider,
      billingMode,
      hasAiProxyUrl,
      hasSupabaseUrl,
      hasSupabaseAnonKey,
      hasBillingApiUrl,
      hasStripePublishableKey,
    },
  };
};

export const reportEnvironmentValidation = (): EnvironmentValidationResult => {
  const result = validateEnvironment();
  result.errors.forEach((error) => logger.e(`[ENV] ${error}`));
  result.warnings.forEach((warning) => logger.w(`[ENV] ${warning}`));
  return result;
};
