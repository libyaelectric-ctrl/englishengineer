import { AUTH_CONFIG } from './auth.config';
import {
  AuthAdapter,
  LocalAuthAdapter,
  SupabaseAuthAdapter,
  SupabaseReadyAuthAdapter,
} from './auth.adapter';
import { logger } from '@/shared/logger';
import { CloudSyncService } from './cloud-sync.service';
import { UserProfile } from './auth.types';

const localAdapter = new LocalAuthAdapter(AUTH_CONFIG.localAuthAllowed);
const supabaseReadyAdapter = new SupabaseReadyAuthAdapter(
  localAdapter,
  AUTH_CONFIG.supabase
);
const activeAdapter: AuthAdapter = (() => {
  if (AUTH_CONFIG.requestedProvider !== 'supabase') {
    if (!AUTH_CONFIG.localAuthAllowed) {
      logger.e(
        'Local authentication is blocked in production. Configure Supabase auth.'
      );
    }
    return localAdapter;
  }

  if (
    !AUTH_CONFIG.isSupabaseReady ||
    !AUTH_CONFIG.supabase.url ||
    !AUTH_CONFIG.supabase.anonKey
  ) {
    logger.w(
      'Supabase auth requested but env is incomplete. Falling back to LocalAuthProvider.'
    );
    return localAdapter;
  }

  return new SupabaseAuthAdapter();
})();

const syncAfterAuth = async (
  user: UserProfile | null,
  reason: 'auth-state-ready' | 'profile-updated'
): Promise<void> => {
  if (!user || !(activeAdapter instanceof SupabaseAuthAdapter)) {
    return;
  }

  await CloudSyncService.queueSync(reason, user.id);
  await CloudSyncService.flushQueue(user.id);
};

export const AuthService = {
  getProviderMode(): 'local' | 'supabase' {
    return activeAdapter instanceof SupabaseAuthAdapter ? 'supabase' : 'local';
  },

  getReadinessLabel(): string {
    if (this.getProviderMode() === 'supabase') {
      return 'Supabase auth provider active.';
    }
    return supabaseReadyAdapter.getReadinessLabel();
  },

  async getCurrentUser() {
    const activeUser = await activeAdapter.getCurrentUser();
    return activeUser ?? localAdapter.getCurrentUser();
  },

  async restoreSession() {
    const activeUser = await activeAdapter.getCurrentUser();
    const user = activeUser ?? (await localAdapter.getCurrentUser());
    if (activeUser) await syncAfterAuth(activeUser, 'auth-state-ready');
    return user;
  },

  async login(displayName: string, email: string, password?: string) {
    const user = await activeAdapter.login(displayName, email, password);
    await syncAfterAuth(user, 'auth-state-ready');
    return user;
  },

  async signUp(displayName: string, email: string, password: string) {
    const user = activeAdapter.signUp
      ? await activeAdapter.signUp(displayName, email, password)
      : await activeAdapter.login(displayName, email);
    await syncAfterAuth(user, 'auth-state-ready');
    return user;
  },

  async demoLogin() {
    return localAdapter.demoLogin();
  },

  async logout() {
    await Promise.all([activeAdapter.logout(), localAdapter.logout()]);
  },

  async updateProfile(
    updates: Parameters<typeof activeAdapter.updateProfile>[0]
  ) {
    const localUser = await localAdapter.getCurrentUser();
    if (localUser?.id.startsWith('demo_engineer_')) {
      return localAdapter.updateProfile(updates);
    }
    const user = await activeAdapter.updateProfile(updates);
    await syncAfterAuth(user, 'profile-updated');
    return user;
  },

  resetPassword(email: string) {
    if (!activeAdapter.resetPassword) {
      return Promise.resolve();
    }
    return activeAdapter.resetPassword(email);
  },
};
