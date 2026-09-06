import { beforeEach, describe, expect, it } from 'vitest';

import {
  getBackendAuthHeaders,
  invalidateOrgCache,
  setAuthTokenGetter,
} from '@/shared/services/auth-backend/backend-auth.service';

describe('getBackendAuthHeaders (Firebase flow)', () => {
  beforeEach(() => {
    setAuthTokenGetter(null);
    invalidateOrgCache();
  });

  it('sends the Firebase ID token as a Bearer token when a getter is registered', async () => {
    setAuthTokenGetter(async () => 'firebase-id-token');
    const headers = await getBackendAuthHeaders('user_123');
    expect(headers['Authorization']).toBe('Bearer firebase-id-token');
    expect(headers['X-EngVox-User-Id']).toBe('user_123');
  });

  it('returns no Authorization header when the auth getter resolves null', async () => {
    setAuthTokenGetter(async () => null);
    const headers = await getBackendAuthHeaders('user_123');
    expect(headers['Authorization']).toBeUndefined();
  });

  it('still surfaces the local user id when no auth getter is registered', async () => {
    setAuthTokenGetter(null);
    const headers = await getBackendAuthHeaders('user_123');
    expect(headers['Authorization']).toBeUndefined();
    expect(headers['X-EngVox-User-Id']).toBe('user_123');
  });
});
