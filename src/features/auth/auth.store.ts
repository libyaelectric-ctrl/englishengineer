import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { logger } from '@/shared/logger';
import { storage } from '@/shared/storage';
import { AuthState, UserProfile } from '@/shared/types/auth.types';

import { LearningProfileRepository } from '@/features/profile/profile.repository';

interface AuthActions {
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loginAsLocal: (userData: { email: string; displayName?: string; discipline?: string }) => UserProfile;
  enterDemoUser: () => UserProfile;
  setClerkUserSync: (fn: ((updates: Partial<UserProfile>) => Promise<void>) | null) => void;
  setClerkSignOut: (fn: (() => Promise<void>) | null) => void;
}

const getInitialUser = (): UserProfile | null => {
  try {
    const saved = storage.globalGet<UserProfile>('auth_user');
    if (saved && saved.id) {
      storage.setUserId(saved.id);
      return saved;
    }
  } catch (e) {
    logger.w('Failed to restore saved auth user', e);
  }
  return null;
};

const initialUser = getInitialUser();

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      currentUser: initialUser,
      isAuthenticated: Boolean(initialUser),
      isLoading: !initialUser,
      clerkUserSync: null,
      clerkSignOut: null,

      loginAsLocal: (userData: { email: string; displayName?: string; discipline?: string }) => {
        const cleanEmail = userData.email.trim().toLowerCase();
        const userId = `eng_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const namePart = userData.displayName || cleanEmail.split('@')[0] || 'Engineer';
        const profile: UserProfile = {
          id: userId,
          displayName: namePart,
          email: cleanEmail,
          role: 'engineer',
          isSuperUser: false,
          engineeringDiscipline: userData.discipline || 'electrical',
          targetLevel: 'B2',
          location: '',
          avatarInitials: namePart.slice(0, 2).toUpperCase(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storage.setUserId(userId);
        storage.globalSet('auth_user', profile);
        try {
          LearningProfileRepository.updatePreferences(userId, {
            discipline: (profile.engineeringDiscipline || 'electrical') as any,
            onboardingCompleted: true,
            interfaceLanguage: 'tr',
          });
        } catch (e) {
          logger.w('Failed to set initial preferences for local user', e);
        }
        set({ currentUser: profile, isAuthenticated: true, isLoading: false });
        return profile;
      },

      enterDemoUser: () => {
        const demoId = `demo_engineer_${Date.now()}`;
        const profile: UserProfile = {
          id: demoId,
          displayName: 'Demo Engineer',
          email: 'demo@engvox.com',
          role: 'engineer',
          isSuperUser: false,
          engineeringDiscipline: 'electrical',
          targetLevel: 'B2',
          location: '',
          avatarInitials: 'DE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storage.setUserId(demoId);
        storage.globalSet('auth_user', profile);
        try {
          LearningProfileRepository.updatePreferences(demoId, {
            discipline: 'electrical',
            onboardingCompleted: true,
            interfaceLanguage: 'tr',
          });
        } catch (e) {
          logger.w('Failed to set initial preferences for demo user', e);
        }
        set({ currentUser: profile, isAuthenticated: true, isLoading: false });
        return profile;
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          const clerkSignOut = useAuthStore.getState().clerkSignOut;
          if (clerkSignOut) {
            await clerkSignOut();
          }
          set({ currentUser: null, isAuthenticated: false });
          storage.globalRemove('auth_user');
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
          const updated = { ...current, ...updates };
          set({ currentUser: updated });
          storage.globalSet('auth_user', updated);

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
