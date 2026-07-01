import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AUTH_CONFIG } from './auth.config';
import { EngineerOSDatabase } from './supabase.types';

let cachedClient: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => AUTH_CONFIG.isSupabaseReady;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (
    !AUTH_CONFIG.isSupabaseReady ||
    !AUTH_CONFIG.supabase.url ||
    !AUTH_CONFIG.supabase.anonKey
  ) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient<EngineerOSDatabase>(
      AUTH_CONFIG.supabase.url,
      AUTH_CONFIG.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  return cachedClient;
};
