import { logger } from '@/shared/logger';

export interface SupabaseReadyConfig {
  url: string | null;
  anonKey: string | null;
  anonKeyConfigured: boolean;
  urlValid: boolean;
  keyValid: boolean;
}

interface AuthEnv {
  VITE_AUTH_PROVIDER?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_ALLOW_LOCAL_AUTH?: string;
  PROD?: boolean;
}

const env: AuthEnv | undefined = import.meta.env;

export const isLocalAuthAllowed = (isProduction: boolean, explicitOverride?: string): boolean =>
  !isProduction || explicitOverride === 'true';

const isSupabaseUrlValid = (url: string | null): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.supabase.co') || parsed.hostname === 'localhost';
  } catch (e) {
    logger.w('[AUTH] Supabase URL validation failed', e);
    return false;
  }
};

const isSupabaseKeyValid = (key: string | null): boolean => {
  if (!key) return false;
  if (!key.startsWith('eyJ')) return false;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return Boolean(payload.aud || payload.sub || payload.role);
  } catch (e) {
    logger.w('[AUTH] Supabase key validation failed', e);
    return false;
  }
};

export const AUTH_CONFIG: {
  requestedProvider: 'local' | 'supabase';
  supabase: SupabaseReadyConfig;
  isSupabaseReady: boolean;
  isProduction: boolean;
  localAuthAllowed: boolean;
} = {
  requestedProvider: env?.VITE_AUTH_PROVIDER === 'supabase' ? 'supabase' : 'local',
  supabase: {
    url: env?.VITE_SUPABASE_URL || null,
    anonKey: env?.VITE_SUPABASE_ANON_KEY || null,
    anonKeyConfigured: Boolean(env?.VITE_SUPABASE_ANON_KEY),
    urlValid: isSupabaseUrlValid(env?.VITE_SUPABASE_URL ?? null),
    keyValid: isSupabaseKeyValid(env?.VITE_SUPABASE_ANON_KEY ?? null),
  },
  isSupabaseReady: Boolean(
    env?.VITE_AUTH_PROVIDER === 'supabase' &&
    isSupabaseUrlValid(env?.VITE_SUPABASE_URL ?? null) &&
    isSupabaseKeyValid(env?.VITE_SUPABASE_ANON_KEY ?? null)
  ),
  isProduction: env?.PROD === true,
  get localAuthAllowed() {
    return isLocalAuthAllowed(this.isProduction, env?.VITE_ALLOW_LOCAL_AUTH);
  },
};
