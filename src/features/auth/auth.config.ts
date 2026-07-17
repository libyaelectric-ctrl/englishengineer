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

interface ImportMetaWithAuthEnv {
  env?: AuthEnv;
}

const env = (import.meta as unknown as ImportMetaWithAuthEnv).env;

export const isLocalAuthAllowed = (
  isProduction: boolean,
  explicitOverride?: string
): boolean => !isProduction || explicitOverride === 'true';

const isSupabaseUrlValid = (url: string | null): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.supabase.co') || parsed.hostname === 'localhost';
  } catch {
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
  } catch {
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
  requestedProvider:
    env?.VITE_AUTH_PROVIDER === 'supabase' ? 'supabase' : 'local',
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
  localAuthAllowed: true,
};
