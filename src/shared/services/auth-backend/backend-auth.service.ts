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

  // No Clerk bridge configured yet: surface the local user id for engineering
  // visibility, but never fall back to a Supabase session.
  if (localUserId) {
    headers['X-EngVox-User-Id'] = localUserId;
  }

  return headers;
};
