import { updateProfile } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { setAuthTokenGetter } from '@/shared/services/auth-backend/backend-auth.service';
import { storage } from '@/shared/storage';
import type { UserProfile } from '@/shared/types/auth.types';
import type { CareerTrackId, InterfaceLanguage } from '@/shared/types/domain.types';
import { useLocalizationStore, type SupportedInterfaceLanguage } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { consumePendingOnboard } from '@/pages/OnboardPage';
import { useFirebaseAuth } from './FirebaseAuth';
import { useAuthStore } from './auth.store';
const initials = (name: string, email: string): string => name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || (email[0] || 'U').toUpperCase();
const buildProfile = async (user: NonNullable<ReturnType<typeof useFirebaseAuth>['user']>): Promise<UserProfile> => { const email = user.email || ''; let role: string | null = null; let isSuperUser = false; try { const token = await user.getIdTokenResult(); role = typeof token.claims.role === 'string' ? token.claims.role : null; isSuperUser = token.claims.isSuperUser === true || role === 'Super Administrator'; } catch { /* Offline claims use least privilege. */ } return { id: user.uid, displayName: user.displayName || email.split('@')[0] || 'Engineer', email, role: role || 'engineer', isSuperUser, engineeringDiscipline: '', targetLevel: '', location: '', avatarInitials: initials(user.displayName || '', email), createdAt: new Date(user.metadata.creationTime || Date.now()).toISOString(), updatedAt: new Date(user.metadata.lastSignInTime || Date.now()).toISOString() }; };
export const FirebaseBridge = () => {
  const { isLoaded, isSignedIn, user, getIdToken, signOut } = useFirebaseAuth();
  const bridgedUserId = useRef<string | null>(null);
  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    const seed = async (): Promise<void> => {
      if (!user) return;
      storage.activateSession({ userId: user.uid, kind: 'firebase' });
      storage.globalRemove('auth_user'); storage.globalRemove('auth_session_v2');
      const profile = await buildProfile(user);
      if (cancelled) return;
      const pending = consumePendingOnboard();
      if (pending) { useLocalizationStore.getState().setLanguage(pending.language as SupportedInterfaceLanguage); LearningProfileRepository.updatePreferences(user.uid, { discipline: pending.discipline as EngineeringDiscipline, professionalTrack: pending.discipline as CareerTrackId, interfaceLanguage: pending.language as InterfaceLanguage, onboardingCompleted: true }); profile.engineeringDiscipline = pending.discipline; }
      else { const existing = LearningProfileRepository.getProfile(user.uid); if (existing.discipline) profile.engineeringDiscipline = existing.discipline; }
      useAuthStore.setState({ currentUser: profile, isAuthenticated: true, isLoading: false, sessionKind: 'firebase' });
      useAuthStore.getState().setProviderSignOut(() => signOut());
      useAuthStore.getState().setProviderUserSync(async (updates) => { if (updates.displayName) await updateProfile(user, { displayName: updates.displayName.trim() }); });
      bridgedUserId.current = user.uid;
    };
    if (isSignedIn && user) { setAuthTokenGetter(async () => (await getIdToken()) ?? null); void seed(); return () => { cancelled = true; }; }
    if (isSignedIn === false) {
      setAuthTokenGetter(null);
      storage.globalRemove('auth_user');
      const state = useAuthStore.getState();
      if (state.sessionKind === 'firebase' || bridgedUserId.current) { bridgedUserId.current = null; storage.deactivateSession(); useAuthStore.setState({ currentUser: null, isAuthenticated: false, isLoading: false, sessionKind: null, providerUserSync: null, providerSignOut: null }); }
      else if (!state.currentUser) useAuthStore.setState({ isLoading: false });
    }
    return () => { cancelled = true; };
  }, [getIdToken, isLoaded, isSignedIn, signOut, user]);
  return null;
};
