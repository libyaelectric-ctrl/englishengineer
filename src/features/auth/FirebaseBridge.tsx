import { updateProfile } from 'firebase/auth';

import { useEffect, useRef } from 'react';

import { useLearningStore } from '@/core/learning';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { setAuthTokenGetter } from '@/shared/services/auth-backend/backend-auth.service';
import { storage } from '@/shared/storage';
import type { UserProfile } from '@/shared/types/auth.types';
import type { CareerTrackId, InterfaceLanguage } from '@/shared/types/domain.types';

import { useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { consumePendingOnboard } from '@/pages/OnboardPage';

import { useFirebaseAuth } from './FirebaseAuth';
import { useAuthStore } from './auth.store';

const toInitials = (name: string, email: string): string => {
  const fromName = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  if (fromName) return fromName;
  return (email[0] || 'U').toUpperCase();
};

const buildProfile = async (
  user: NonNullable<ReturnType<typeof useFirebaseAuth>['user']>
): Promise<UserProfile> => {
  const email = user.email || '';
  // Admin role + super-user flag live in Firebase custom claims (set via the
  // Admin SDK / console tooling). Absent claims default to a plain engineer.
  let metadataRole: string | null = null;
  let isSuperUser = false;
  try {
    const tokenResult = await user.getIdTokenResult();
    metadataRole = typeof tokenResult.claims.role === 'string' ? tokenResult.claims.role : null;
    isSuperUser = tokenResult.claims.isSuperUser === true || metadataRole === 'Super Administrator';
  } catch {
    // Claims unavailable (offline / first sign-in race) — fall through with
    // default role; the next token refresh re-evaluates them.
  }
  return {
    id: user.uid,
    displayName: user.displayName || email.split('@')[0] || 'Engineer',
    email,
    role: metadataRole || 'engineer',
    isSuperUser,
    engineeringDiscipline: '',
    targetLevel: '',
    location: '',
    avatarInitials: toInitials(user.displayName || '', email),
    createdAt: (user.metadata.creationTime
      ? new Date(user.metadata.creationTime)
      : new Date()
    ).toISOString(),
    updatedAt: (user.metadata.lastSignInTime
      ? new Date(user.metadata.lastSignInTime)
      : new Date()
    ).toISOString(),
  };
};

// Legacy local-auth record. When Firebase Auth is the auth of record we clear
// it so that AuthService.restoreSession() can never resurrect a stale
// demo/local user.
const LEGACY_AUTH_STORAGE_KEY = 'auth_user';

/**
 * Keeps the app's zustand auth store in sync with the Firebase session so
 * that routes guarded by <AuthGuard> recognize a Firebase sign-in.
 *
 * Firebase Auth is the auth of record: whenever a session is active it always
 * seeds the store (replacing any legacy/demo user that a previous local-auth
 * session left behind). The bridge only clears a user that it seeded itself.
 */
export const FirebaseBridge = () => {
  const { isLoaded, isSignedIn, user, getIdToken, signOut } = useFirebaseAuth();
  const bridgedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    const seed = async (): Promise<void> => {
      if (!user) return;
      const state = useAuthStore.getState();

      // Firebase always wins — never let a stale demo/local session shadow
      // the signed-in Firebase user.
      storage.globalRemove(LEGACY_AUTH_STORAGE_KEY);

      const alreadyMine = state.currentUser?.id === user.uid;
      const profile = await buildProfile(user);
      if (cancelled) return;

      if (!alreadyMine) {
        // Scope storage to this user BEFORE reading any user-scoped data so
        // the profile repository resolves the same key that onboarding writes
        // (eos_user_<id>_learning_profile_<id>) instead of an unprefixed key.
        storage.setUserId(user.uid);

        // Apply pending onboard selections (saved before sign-in from /onboard)
        const pending = consumePendingOnboard();
        if (pending) {
          useLocalizationStore
            .getState()
            .setLanguage(pending.language as SupportedInterfaceLanguage);
          LearningProfileRepository.updatePreferences(user.uid, {
            discipline: pending.discipline as EngineeringDiscipline,
            professionalTrack: pending.discipline as CareerTrackId,
            interfaceLanguage: pending.language as InterfaceLanguage,
            onboardingCompleted: true,
          });
          profile.engineeringDiscipline = pending.discipline;
          useLearningStore.getState().resetAll();
        } else {
          // Hydrate the discipline the user picked during onboarding so pages
          // like the dashboard read it off the store correctly on every visit.
          const existing = LearningProfileRepository.getProfile(user.uid);
          if (existing.discipline) {
            profile.engineeringDiscipline = existing.discipline;
          }
        }

        storage.globalSet('auth_user', profile);
        useAuthStore.setState({
          currentUser: profile,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      // End the app's logout() on the Firebase session as well, so Sign Out
      // fully signs the user out instead of leaving a live session that
      // bounces the user back into a guard that waits forever.
      useAuthStore.getState().setProviderSignOut(() => signOut());

      // Persist display-field edits (displayName) to the Firebase account so
      // profile changes survive a reload/sign-in.
      useAuthStore.getState().setProviderUserSync(async (updates) => {
        if (!updates.displayName) return;
        await updateProfile(user, { displayName: updates.displayName.trim() });
      });

      bridgedUserId.current = user.uid;
    };

    if (isSignedIn && user) {
      // Register the token getter SYNCHRONOUSLY before any async seed() work.
      // This ensures billing API calls always have an Authorization header,
      // even if seed() hasn't finished profile hydration yet.
      setAuthTokenGetter(async () => (await getIdToken()) ?? null);
      void seed();
      return () => {
        cancelled = true;
      };
    }

    if (isSignedIn === false) {
      const current = useAuthStore.getState().currentUser;
      if (current && bridgedUserId.current && current.id === bridgedUserId.current) {
        bridgedUserId.current = null;
        storage.setUserId(null);
        storage.globalRemove('auth_user');
        useAuthStore.setState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
        useAuthStore.getState().setProviderUserSync(null);
        useAuthStore.getState().setProviderSignOut(null);
        setAuthTokenGetter(null);
      } else if (!current) {
        useAuthStore.setState({
          isLoading: false,
        });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user, signOut, getIdToken]);

  return null;
};
