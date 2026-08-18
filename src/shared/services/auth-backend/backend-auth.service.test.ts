import { beforeEach, describe, expect, it } from 'vitest';

import {
  getBackendAuthHeaders,
  invalidateOrgCache,
  setClerkTokenGetter,
} from '@/shared/services/auth-backend/backend-auth.service';

describe('getBackendAuthHeaders (Clerk flow)', () => {
  beforeEach(() => {
    setClerkTokenGetter(null);
    invalidateOrgCache();
  });

  it('sends the Clerk session JWT as a Bearer token when a getter is registered', async () => {
    setClerkTokenGetter(async () => 'clerk-session-jwt');
    const headers = await getBackendAuthHeaders('user_123');
    expect(headers['Authorization']).toBe('Bearer clerk-session-jwt');
    expect(headers['X-EngVox-User-Id']).toBe('user_123');
  });

  it('returns no Authorization header when the Clerk getter resolves null', async () => {
    setClerkTokenGetter(async () => null);
    const headers = await getBackendAuthHeaders('user_123');
    expect(headers['Authorization']).toBeUndefined();
  });

  it('still surfaces the local user id when no Clerk getter is registered', async () => {
    setClerkTokenGetter(null);
    const headers = await getBackendAuthHeaders('user_123');
    expect(headers['Authorization']).toBeUndefined();
    expect(headers['X-EngVox-User-Id']).toBe('user_123');
  });
});
