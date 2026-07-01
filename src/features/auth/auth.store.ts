import { create } from 'zustand';
import { AuthState, UserProfile } from './auth.types';
import { AuthService } from './auth.service';
import { logger } from '@/shared/logger';

interface AuthActions {
  initialize: () => Promise<void>;
  login: (
    displayName: string,
    email: string,
    password?: string
  ) => Promise<void>;
  signUp: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  providerMode: 'local' | 'supabase';
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  providerMode: AuthService.getProviderMode(),

  initialize: async () => {
    set({ isLoading: true });
    try {
      const user = await AuthService.restoreSession();
      if (user) {
        set({ currentUser: user, isAuthenticated: true });
      } else {
        set({ currentUser: null, isAuthenticated: false });
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
    } catch (e) {
      logger.e('Auth logout failed.', e);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    try {
      const updated = await AuthService.updateProfile(updates);
      set({ currentUser: updated });
    } catch (e) {
      logger.e('Auth profile update failed.', e);
      throw e;
    }
  },
}));
export default useAuthStore;
