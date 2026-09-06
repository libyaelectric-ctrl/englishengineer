let cachedOrgId: string | null = null;
let cachedUserId: string | null = null;

/**
 * Resolves the active Firebase Auth ID token (registered by <FirebaseBridge>).
 * Kept separate from the zustand auth store so importing this service never
 * drags the store (and its AuthService reference) into a test's module graph.
 */
let authTokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (fn: (() => Promise<string | null>) | null): void => {
  authTokenGetter = fn;
};

export const invalidateOrgCache = (): void => {
  cachedOrgId = null;
  cachedUserId = null;
};

export const getBackendAuthHeaders = async (
  localUserId?: string
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  console.log('[backend-auth] getBackendAuthHeaders called, authTokenGetter:', !!authTokenGetter, 'localUserId:', localUserId);

  // Firebase Auth is the auth of record while a session is alive: send the
  // Firebase ID token and skip the Supabase session entirely (Firebase users
  // have none).
  if (authTokenGetter) {
    const token = await authTokenGetter();
    console.log('[backend-auth] token result:', token ? 'OK (len=' + token.length + ')' : 'NULL');
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
    console.log('[backend-auth] returning headers:', JSON.stringify({ hasAuth: !!headers['Authorization'], hasUserId: !!headers['X-EngVox-User-Id'] }));
    return headers;
  }

  console.log('[backend-auth] authTokenGetter is NULL — returning no Authorization');
  // No Firebase bridge configured yet: surface the local user id for
  // engineering visibility, but never fall back to a Supabase session.
  if (localUserId) {
    headers['X-EngVox-User-Id'] = localUserId;
  }

  return headers;
};
