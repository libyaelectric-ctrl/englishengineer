export interface SupabaseReadyConfig {
  url: string | null;
  anonKey: string | null;
  anonKeyConfigured: boolean;
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

const isAnonKeyValid = (key: string | null): boolean => {
  if (!key) return false;
  return key.startsWith('eyJ');
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
  },
  isSupabaseReady: Boolean(
    env?.VITE_AUTH_PROVIDER === 'supabase' &&
    env?.VITE_SUPABASE_URL &&
    isAnonKeyValid(env?.VITE_SUPABASE_ANON_KEY ?? null)
  ),
  isProduction: env?.PROD === true,
  localAuthAllowed: true,
};
