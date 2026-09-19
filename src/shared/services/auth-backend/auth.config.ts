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

const isLocalAuthAllowed = (_isProduction: boolean, _explicitOverride?: string): boolean => {
  return true;
};

const isSupabaseUrlValid = (url: string | null): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.supabase.co') || parsed.hostname === 'localhost';
  } catch {
    // Invalid URL shapes are routine env noise (e.g. a bare host without
    // scheme); the caller treats false as "not configured".
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
    // A key that starts with `eyJ` but fails JWT-shaped parsing is routine
    // env noise; callers already treat false as "supabase not configured".
    return false;
  }
};

export const AUTH_CONFIG: {
  requestedProvider: 'local' | 'supabase' | 'firebase';
  supabase: SupabaseReadyConfig;
  isSupabaseReady: boolean;
  isProduction: boolean;
  localAuthAllowed: boolean;
} = {
  requestedProvider:
    env?.VITE_AUTH_PROVIDER === 'supabase'
      ? 'supabase'
      : env?.VITE_AUTH_PROVIDER === 'firebase'
        ? 'firebase'
        : 'local',
  supabase: {
    url: env?.VITE_SUPABASE_URL || null,
    anonKey: env?.VITE_SUPABASE_ANON_KEY || null,
    anonKeyConfigured: Boolean(env?.VITE_SUPABASE_ANON_KEY),
    urlValid: isSupabaseUrlValid(env?.VITE_SUPABASE_URL ?? null),
    keyValid: isSupabaseKeyValid(env?.VITE_SUPABASE_ANON_KEY ?? null),
  },
  // Readiness is a property of Supabase's own credentials, not of which provider signs
  // users in: production signs in with Firebase and still has to read and write the
  // Supabase-backed tables (team, admin, knowledge pool). Gating this on
  // `VITE_AUTH_PROVIDER === 'supabase'` silently disabled all of those code paths.
  isSupabaseReady: Boolean(
    isSupabaseUrlValid(env?.VITE_SUPABASE_URL ?? null) &&
    isSupabaseKeyValid(env?.VITE_SUPABASE_ANON_KEY ?? null)
  ),
  isProduction: env?.PROD === true,
  get localAuthAllowed() {
    return isLocalAuthAllowed(this.isProduction, env?.VITE_ALLOW_LOCAL_AUTH);
  },
};
