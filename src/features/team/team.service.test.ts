import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@/core/errors/error-codes';

/**
 * The regression this file exists for: `inviteMember` read only `data.user` from
 * `supabase.auth.getUser()`. supabase-js resolves that call with `{ data: { user: null },
 * error }` on a store failure instead of rejecting, so a dead identity store was reported to
 * the user as "Not authenticated." — the user was told to sign in again for a fault they
 * cannot act on, and the real fault left no trace anywhere.
 *
 * The same shape sat next to it: `if (memError || !membership)` answered a failed membership
 * query with "You do not belong to an organization", sending an invited colleague to ask for
 * access they already had. Both are asserted below, together with the happy path, so the fix
 * cannot be "throw more" instead of "report the right thing".
 */
const mocks = vi.hoisted(() => ({
  configured: { value: true },
  client: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

vi.mock('@/shared/services/auth-backend/supabase.client', () => ({
  isSupabaseConfigured: () => mocks.configured.value,
  getSupabaseClient: () => mocks.client,
}));

const { TeamService } = await import('./team.service');

/** A PostgREST builder that resolves to `result` at whichever terminal call the code makes. */
const query = (result: unknown) => {
  const builder = {
    select: () => builder,
    limit: () => builder,
    eq: () => builder,
    order: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    single: () => Promise.resolve(result),
    maybeSingle: () => Promise.resolve(result),
  };
  return builder;
};

const respondWith = ({ membership, invitation }: { membership: unknown; invitation?: unknown }) => {
  mocks.client.from.mockImplementation((table: string) =>
    query(table === 'organization_members' ? membership : (invitation ?? { data: null }))
  );
};

describe('TeamService.inviteMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.configured.value = true;
    mocks.client.from.mockReset();
    mocks.client.auth.getUser.mockReset();
  });

  it('reports an identity-store failure as a network problem, not as "not authenticated"', async () => {
    respondWith({ membership: { data: { organization_id: 'org_1' }, error: null } });
    mocks.client.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'fetch failed' },
    });

    await expect(TeamService.inviteMember('colleague@example.com', 'member')).rejects.toMatchObject(
      {
        code: ErrorCode.NETWORK,
        message: expect.stringContaining('could not be verified'),
      }
    );
  });

  it('still reports a genuinely missing session as unauthenticated', async () => {
    respondWith({ membership: { data: { organization_id: 'org_1' }, error: null } });
    mocks.client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(TeamService.inviteMember('colleague@example.com', 'member')).rejects.toMatchObject(
      {
        code: ErrorCode.AUTH,
        message: 'Not authenticated.',
      }
    );
  });

  it('reports a failed membership read as a network problem, not as "no organization"', async () => {
    respondWith({ membership: { data: null, error: { message: 'store down' } } });
    mocks.client.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user_1' } },
      error: null,
    });

    await expect(TeamService.inviteMember('colleague@example.com', 'member')).rejects.toMatchObject(
      {
        code: ErrorCode.NETWORK,
        message: expect.stringContaining('could not be read'),
      }
    );
  });

  it('still reports a missing membership as "no organization"', async () => {
    respondWith({ membership: { data: null, error: null } });

    await expect(TeamService.inviteMember('colleague@example.com', 'member')).rejects.toMatchObject(
      {
        code: ErrorCode.AUTH,
        message: 'You do not belong to an organization and cannot invite members.',
      }
    );
  });

  it('invites the member when every read succeeds', async () => {
    respondWith({
      membership: { data: { organization_id: 'org_1' }, error: null },
      invitation: {
        data: {
          id: 'invite_1',
          email: 'colleague@example.com',
          role: 'member',
          status: 'pending',
          created_at: '2026-09-22T10:00:00.000Z',
        },
        error: null,
      },
    });
    mocks.client.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user_1' } },
      error: null,
    });

    await expect(
      TeamService.inviteMember('colleague@example.com', 'member')
    ).resolves.toMatchObject({
      id: 'invite_1',
      organizationId: 'org_1',
      email: 'colleague@example.com',
      status: 'pending',
    });
  });
});
