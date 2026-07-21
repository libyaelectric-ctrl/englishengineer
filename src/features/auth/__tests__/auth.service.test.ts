import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const mockUserProfile = {
  id: 'user_test_123',
  displayName: 'Test Engineer',
  email: 'test@engineer.com',
  role: 'Engineer',
  engineeringDiscipline: 'Civil',
  targetLevel: 'B2',
  location: 'Site',
  avatarInitials: 'TE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const createMockAdapter = () => ({
  getCurrentUser: vi.fn().mockResolvedValue(null),
  login: vi.fn().mockResolvedValue(mockUserProfile),
  signUp: vi.fn().mockResolvedValue(mockUserProfile),
  demoLogin: vi.fn().mockResolvedValue({
    ...mockUserProfile,
    id: 'demo_engineer_test',
    displayName: 'Demo Engineer',
  }),
  logout: vi.fn().mockResolvedValue(undefined),
  updateProfile: vi.fn().mockResolvedValue(mockUserProfile),
  resetPassword: vi.fn().mockResolvedValue(undefined),
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setupAndImport = async () => {
    const mockAdapter = createMockAdapter();

    vi.doMock('../auth.config', () => ({
      AUTH_CONFIG: {
        requestedProvider: 'local',
        supabase: {
          url: null,
          anonKey: null,
          anonKeyConfigured: false,
          urlValid: false,
          keyValid: false,
        },
        isSupabaseReady: false,
        isProduction: false,
        localAuthAllowed: true,
      },
      isLocalAuthAllowed: vi.fn().mockReturnValue(true),
    }));

    vi.doMock('../auth.adapter', () => {
      class MockLocalAdapter {
        constructor(_enabled?: boolean) {}
        getCurrentUser = mockAdapter.getCurrentUser;
        login = mockAdapter.login;
        signUp = mockAdapter.signUp;
        demoLogin = mockAdapter.demoLogin;
        logout = mockAdapter.logout;
        updateProfile = mockAdapter.updateProfile;
        resetPassword = mockAdapter.resetPassword;
      }

      class MockSupabaseReadyAdapter {
        constructor(_fallback: unknown, _config: unknown) {}
        getCurrentUser = mockAdapter.getCurrentUser;
        login = mockAdapter.login;
        signUp = mockAdapter.signUp;
        demoLogin = mockAdapter.demoLogin;
        logout = mockAdapter.logout;
        updateProfile = mockAdapter.updateProfile;
        getReadinessLabel = vi.fn().mockReturnValue('Ready');
      }

      return {
        LocalAuthAdapter: MockLocalAdapter,
        SupabaseReadyAuthAdapter: MockSupabaseReadyAdapter,
        SupabaseAuthAdapter: vi.fn(),
      };
    });

    vi.doMock('../cloud-sync.service', () => ({
      CloudSyncService: {
        queueSync: vi.fn().mockResolvedValue({ status: 'idle' }),
        flushQueue: vi.fn().mockResolvedValue({ status: 'synced' }),
      },
    }));

    const { AuthService } = await import('../auth.service');
    return { AuthService, mockAdapter };
  };

  it('getProviderMode returns local when supabase not configured', async () => {
    const { AuthService } = await setupAndImport();
    expect(AuthService.getProviderMode()).toBe('local');
  });

  it('getReadinessLabel returns a readiness message', async () => {
    const { AuthService } = await setupAndImport();
    const label = AuthService.getReadinessLabel();
    expect(typeof label).toBe('string');
    expect(label.length).toBeGreaterThan(0);
  });

  it('login delegates to active adapter', async () => {
    const { AuthService, mockAdapter } = await setupAndImport();
    const user = await AuthService.login('Test', 'test@engineer.com', 'password123');

    expect(user).toBeDefined();
    expect(user.id).toBe('user_test_123');
    expect(mockAdapter.login).toHaveBeenCalledWith('Test', 'test@engineer.com', 'password123');
  });

  it('signUp delegates to active adapter', async () => {
    const { AuthService, mockAdapter } = await setupAndImport();
    const user = await AuthService.signUp('Test', 'test@engineer.com', 'password123');

    expect(user).toBeDefined();
    expect(mockAdapter.signUp).toHaveBeenCalledWith('Test', 'test@engineer.com', 'password123');
  });

  it('logout calls adapter', async () => {
    const { AuthService, mockAdapter } = await setupAndImport();
    await AuthService.logout();

    expect(mockAdapter.logout).toHaveBeenCalled();
  });

  it('getCurrentUser returns null when no user', async () => {
    const { AuthService } = await setupAndImport();
    const user = await AuthService.getCurrentUser();
    expect(user).toBeNull();
  });

  it('demoLogin returns demo user', async () => {
    const { AuthService } = await setupAndImport();
    const user = await AuthService.demoLogin();

    expect(user).toBeDefined();
    expect(user.id).toContain('demo_engineer_');
    expect(user.displayName).toBe('Demo Engineer');
  });

  it('resetPassword resolves without error', async () => {
    const { AuthService } = await setupAndImport();
    await expect(AuthService.resetPassword('test@engineer.com')).resolves.toBeUndefined();
  });
});
