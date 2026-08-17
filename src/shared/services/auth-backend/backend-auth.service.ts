import { logger } from '@/shared/logger';

import { getSupabaseClient } from './supabase.client';

let cachedOrgId: string | null = null;
let cachedUserId: string | null = null;

/**
 * Resolves the active Clerk session JWT (registered by <ClerkBridge>). Kept
 * separate from the zustand auth store so importing this service never drags
 * the store (and its AuthService reference) into a test's module graph.
 */
let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export const setClerkTokenGetter = (fn: (() => Promise<string | null>) | null): void => {
  clerkTokenGetter = fn;
};

export const invalidateOrgCache = (): void => {
  cachedOrgId = null;
  cachedUserId = null;
};

export const getBackendAuthHeaders = async (
  localUserId?: string
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  // Clerk is the auth of record while a session is alive: send the Clerk JWT
  // and skip the Supabase session entirely (Clerk users have none).
  if (clerkTokenGetter) {
    const token = await clerkTokenGetter();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (cachedUserId !== localUserId) {
      cachedOrgId = null;
      cachedUserId = localUserId ?? null;
    }
    if (localUserId) {
      headers['X-EngVox-User-Id'] = localUserId;
    }
    if (cachedOrgId) {
      headers['X-EngineerOS-Org-Id'] = cachedOrgId;
      headers['X-Corporation-Id'] = cachedOrgId;
    }
    return headers;
  }

  const client = getSupabaseClient();
  if (client) {
    const { data } = await client.auth.getSession();
    if (data.session?.access_token) {
      headers['Authorization'] = `Bearer ${data.session.access_token}`;

      const sessionUserId = data.session.user?.id ?? null;
      if (cachedUserId !== sessionUserId) {
        cachedOrgId = null;
        cachedUserId = sessionUserId;
      }

      if (!cachedOrgId) {
        try {
          const { data: membership } = await client
            .from('organization_members')
            .select('organization_id')
            .limit(1)
            .maybeSingle();
          if (membership?.organization_id) {
            cachedOrgId = membership.organization_id;
          }
        } catch (e) {
          logger.w('[BackendAuth] Failed to fetch organization membership', e);
        }
      }

      if (cachedOrgId) {
        headers['X-EngineerOS-Org-Id'] = cachedOrgId;
        headers['X-Corporation-Id'] = cachedOrgId;
      }
    }
  }

  if (localUserId) {
    headers['X-EngVox-User-Id'] = localUserId;
  }

  return headers;
};
