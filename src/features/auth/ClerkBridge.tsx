import { useAuth, useClerk, useUser } from '@clerk/clerk-react';

import { useEffect, useRef } from 'react';

import { setClerkTokenGetter } from '@/shared/services/auth-backend/backend-auth.service';
import { storage } from '@/shared/storage';

import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { useLearningStore } from '@/core/learning';
import { useLocalizationStore } from '@/features/localization';
import { consumePendingOnboard } from '@/pages/OnboardPage';
import { useAuthStore } from './auth.store';
import type { UserProfile } from './auth.types';

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

type ClerkUser = NonNullable<ReturnType<typeof useUser>['user']>;

const buildProfile = (user: ClerkUser): UserProfile => {
  const email = user.primaryEmailAddress?.emailAddress || '';
  const metadataRole = (user.publicMetadata?.role as string | undefined) ?? null;
  return {
    id: user.id,
    displayName: user.fullName || email.split('@')[0] || 'Clerk User',
    email,
    role: metadataRole || 'engineer',
    isSuperUser:
      user.publicMetadata?.isSuperUser === true || metadataRole === 'Super Administrator',
    engineeringDiscipline: '',
    targetLevel: '',
    location: '',
    avatarInitials: toInitials(user.fullName || '', email),
    createdAt: (user.createdAt ? new Date(user.createdAt) : new Date()).toISOString(),
    updatedAt: (user.updatedAt ? new Date(user.updatedAt) : new Date()).toISOString(),
  };
};

// Legacy local-auth record. When Clerk is the auth of record we clear it so
// AuthService.restoreSession() can never resurrect a stale demo/local user.
const LEGACY_AUTH_STORAGE_KEY = 'auth_user';

/**
 * Keeps the app's zustand auth store in sync with the Clerk session so that
 * routes guarded by <AuthGuard> recognize a Clerk sign-in.
 *
 * Clerk is the auth of record: whenever a Clerk session is active it always
 * seeds the store (replacing any legacy/demo user that a previous local-auth
 * session left behind). The bridge only clears a user that it seeded itself.
 */
export const ClerkBridge = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const bridgedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const state = useAuthStore.getState();

    if (isSignedIn && user) {
      // Clerk always wins — never let a stale demo/local session shadow the
      // signed-in Clerk user.
      storage.globalRemove(LEGACY_AUTH_STORAGE_KEY);

      const alreadyMine = state.currentUser?.id === user.id;
      if (!alreadyMine) {
        // Scope storage to this user BEFORE reading any user-scoped data so
        // the profile repository resolves the same key that onboarding writes
        // (eos_user_<id>_learning_profile_<id>) instead of an unprefixed key.
        storage.setUserId(user.id);

        const profile = buildProfile(user);

        // Apply pending onboard selections (saved before sign-in from /onboard)
        const pending = consumePendingOnboard();
        if (pending) {
          useLocalizationStore.getState().setLanguage(pending.language);
          LearningProfileRepository.updatePreferences(user.id, {
            discipline: pending.discipline,
            professionalTrack: pending.discipline as never,
            interfaceLanguage: pending.language,
            onboardingCompleted: true,
          });
          profile.engineeringDiscipline = pending.discipline;
          useLearningStore.getState().resetAll();
        } else {
          // Hydrate the discipline the user picked during onboarding so pages
          // like the dashboard read it off the store correctly on every visit.
          const existing = LearningProfileRepository.getProfile(user.id);
          if (existing.discipline) {
            profile.engineeringDiscipline = existing.discipline;
          }
        }

        useAuthStore.setState({
          currentUser: profile,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      // End the app's logout() on the Clerk session as well, so Sign Out fully
      // signs the user out instead of leaving a live session that bounces the
      // user back into a guard that waits forever.
      useAuthStore.getState().setClerkSignOut(() => signOut());

      // Expose the session token so getBackendAuthHeaders() can authenticate
      // backend calls with a Clerk JWT (verified against the instance JWKS).
      setClerkTokenGetter(async () => (await getToken()) ?? null);

      // Persist display-field edits (displayName -> first/last name) to the
      // Clerk account so profile changes survive a reload/sign-in.
      useAuthStore.getState().setClerkUserSync(async (updates) => {
        if (!updates.displayName) return;
        const parts = updates.displayName.trim().split(/\s+/).filter(Boolean);
        await user.update({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' '),
        });
      });

      bridgedUserId.current = user.id;
      return;
    }

    if (isSignedIn === false) {
      const current = useAuthStore.getState().currentUser;
      if (current && bridgedUserId.current && current.id === bridgedUserId.current) {
        bridgedUserId.current = null;
        storage.setUserId(null);
        useAuthStore.setState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
        useAuthStore.getState().setClerkUserSync(null);
        useAuthStore.getState().setClerkSignOut(null);
        setClerkTokenGetter(null);
      } else if (!current) {
        useAuthStore.setState({
          isLoading: false,
        });
      }
    }
  }, [isLoaded, isSignedIn, user, signOut, getToken]);

  return null;
};
