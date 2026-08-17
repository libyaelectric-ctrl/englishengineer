import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { logger } from '@/shared/logger';
import { storage } from '@/shared/storage';

import { AuthService } from './auth.service';
import { AuthState, UserProfile } from './auth.types';

interface AuthActions {
  initialize: () => Promise<void>;
  login: (displayName: string, email: string, password?: string) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setClerkUserSync: (fn: ((updates: Partial<UserProfile>) => Promise<void>) | null) => void;
  providerMode: 'local' | 'supabase';
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: true,
      clerkUserSync: null,
      providerMode: AuthService.getProviderMode(),

      initialize: async () => {
        set({ isLoading: true });
        try {
          const user = await AuthService.restoreSession();
          if (user) {
            set({ currentUser: user, isAuthenticated: true });
            storage.setUserId(user.id);
          } else {
            set({ currentUser: null, isAuthenticated: false });
            storage.setUserId(null);
          }
        } catch (e) {
          logger.e('Auth initialization failed.', e);
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (displayName, email, password) => {
        set({ isLoading: true });
        try {
          const user = await AuthService.login(displayName, email, password);
          set({ currentUser: user, isAuthenticated: true });
          storage.setUserId(user.id);
        } catch (e) {
          logger.e('Auth login failed.', e);
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (displayName, email, password) => {
        set({ isLoading: true });
        try {
          const user = await AuthService.signUp(displayName, email, password);
          set({ currentUser: user, isAuthenticated: true });
          storage.setUserId(user.id);
        } catch (e) {
          logger.e('Auth sign up failed.', e);
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      demoLogin: async () => {
        set({ isLoading: true });
        try {
          const user = await AuthService.demoLogin();
          set({ currentUser: user, isAuthenticated: true });
          storage.setUserId(user.id);
        } catch (e) {
          logger.e('Auth demo login failed.', e);
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await AuthService.logout();
          set({ currentUser: null, isAuthenticated: false });
          storage.setUserId(null);
        } catch (e) {
          logger.e('Auth logout failed.', e);
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (updates) => {
        try {
          const current = useAuthStore.getState().currentUser;
          // Clerk is the auth of record: display fields live in the Clerk
          // account, so profile edits update the in-memory user instead of
          // touching the legacy local-auth adapter (which would write to a
          // stale 'auth_user' record that does not belong to this user).
          if (current?.id.startsWith('user_')) {
            set({ currentUser: { ...current, ...updates } });
            // Persist display edits (e.g. displayName) to the Clerk account
            // so they survive a reload/sign-in.
            const sync = useAuthStore.getState().clerkUserSync;
            if (sync && updates.displayName) {
              try {
                await sync(updates);
              } catch (e) {
                logger.w('Clerk profile sync failed.', e);
              }
            }
            return;
          }
          const updated = await AuthService.updateProfile(updates);
          set({ currentUser: updated });
        } catch (e) {
          logger.e('Auth profile update failed.', e);
          throw e;
        }
      },

      setClerkUserSync: (fn) => {
        set({ clerkUserSync: fn });
      },
    }),
    { name: 'AuthStore' }
  )
);
export default useAuthStore;
