import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { logger } from '@/shared/logger';
import { storage } from '@/shared/storage';

import { AuthState, UserProfile } from './auth.types';

interface AuthActions {
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setClerkUserSync: (fn: ((updates: Partial<UserProfile>) => Promise<void>) | null) => void;
  setClerkSignOut: (fn: (() => Promise<void>) | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: true,
      clerkUserSync: null,
      clerkSignOut: null,

      logout: async () => {
        set({ isLoading: true });
        try {
          // End the Clerk session too, otherwise the Sign Out action leaves
          // the Clerk session alive and /login bounces the user straight back
          // to a guard that waits forever for a <ClerkBridge> re-seed.
          const clerkSignOut = useAuthStore.getState().clerkSignOut;
          if (clerkSignOut) {
            await clerkSignOut();
          }
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
          if (!current) return;
          // Clerk is the auth of record: display fields live in the Clerk
          // account, so profile edits update the in-memory user instead of
          // touching any legacy local/supabase adapter.
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
        } catch (e) {
          logger.e('Auth profile update failed.', e);
          throw e;
        }
      },

      setClerkUserSync: (fn) => {
        set({ clerkUserSync: fn });
      },

      setClerkSignOut: (fn) => {
        set({ clerkSignOut: fn });
      },
    }),
    { name: 'AuthStore' }
  )
);
export default useAuthStore;
