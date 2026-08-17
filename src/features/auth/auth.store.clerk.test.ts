import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from './auth.store';

const clerkUser = {
  id: 'user_2xTestClerkId',
  displayName: 'Clerk User',
  email: 'clerk@example.com',
  role: 'engineer' as const,
  engineeringDiscipline: 'electrical',
  targetLevel: 'C1',
  location: 'Remote',
  avatarInitials: 'CU',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('auth store — Clerk profile sync', () => {
  beforeEach(() => {
    useAuthStore.setState({
      currentUser: clerkUser,
      isAuthenticated: true,
      isLoading: false,
      clerkUserSync: null,
    });
  });

  afterEach(() => {
    useAuthStore.setState({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      clerkUserSync: null,
    });
    vi.restoreAllMocks();
  });

  it('updates the in-memory user and persists display edits to the Clerk account', async () => {
    const sync = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ clerkUserSync: sync });

    await useAuthStore.getState().updateProfile({ displayName: 'Jane Doe' });

    expect(useAuthStore.getState().currentUser?.displayName).toBe('Jane Doe');
    expect(sync).toHaveBeenCalledWith({ displayName: 'Jane Doe' });
  });

  it('only syncs display edits to Clerk, other updates stay in-memory', async () => {
    const sync = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ clerkUserSync: sync });

    await useAuthStore.getState().updateProfile({ targetLevel: 'B2' });

    expect(useAuthStore.getState().currentUser?.targetLevel).toBe('B2');
    // Non-display edits never reach the Clerk account.
    expect(sync).not.toHaveBeenCalled();
  });

  it('keeps the in-memory update even if the Clerk sync fails', async () => {
    const sync = vi.fn().mockRejectedValue(new Error('clerk offline'));
    useAuthStore.setState({ clerkUserSync: sync });

    await useAuthStore.getState().updateProfile({ displayName: 'Jane Doe' });

    expect(useAuthStore.getState().currentUser?.displayName).toBe('Jane Doe');
  });
});
