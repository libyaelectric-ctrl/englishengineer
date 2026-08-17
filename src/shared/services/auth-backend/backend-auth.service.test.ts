import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getBackendAuthHeaders,
  invalidateOrgCache,
  setClerkTokenGetter,
} from '@/shared/services/auth-backend/backend-auth.service';

vi.mock('@/shared/services/auth-backend/supabase.client', () => ({
  getSupabaseClient: vi.fn(() => null),
}));

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

  it('falls back to Supabase headers when no Clerk getter is registered', async () => {
    const { getSupabaseClient } = await import('@/shared/services/auth-backend/supabase.client');
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: async () => ({
          data: { session: { access_token: 'supabase-token', user: { id: 'supabase-user' } } },
          error: null,
        }),
      },
      from: () => ({
        select: () => ({
          limit: () => ({
            maybeSingle: async () => ({ data: { organization_id: 'org-1' }, error: null }),
          }),
        }),
      }),
    } as unknown as Parameters<typeof getSupabaseClient>[0]);

    setClerkTokenGetter(null);
    const headers = await getBackendAuthHeaders('supabase-user');
    expect(headers['Authorization']).toBe('Bearer supabase-token');
    expect(headers['X-EngineerOS-Org-Id']).toBe('org-1');
    expect(headers['X-Corporation-Id']).toBe('org-1');
  });
});
