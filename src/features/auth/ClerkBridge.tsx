import { useAuth, useUser } from '@clerk/clerk-react';

import { useEffect, useRef } from 'react';

import { storage } from '@/shared/storage';

import { LearningProfileRepository } from '@/features/profile/profile.repository';

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
  return {
    id: user.id,
    displayName: user.fullName || email.split('@')[0] || 'Clerk User',
    email,
    role: 'engineer',
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
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
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
        const profile = buildProfile(user);
        // Hydrate the discipline the user picked during onboarding so pages
        // like the dashboard that read it off the store user render correctly
        // on every visit, not just the first.
        const learningProfile = LearningProfileRepository.getProfile(user.id);
        if (learningProfile.discipline) {
          profile.engineeringDiscipline = learningProfile.discipline;
        }
        useAuthStore.setState({
          currentUser: profile,
          isAuthenticated: true,
          isLoading: false,
        });
        storage.setUserId(user.id);
      }
      bridgedUserId.current = user.id;
      return;
    }

    if (isSignedIn === false) {
      const current = useAuthStore.getState().currentUser;
      if (current && bridgedUserId.current && current.id === bridgedUserId.current) {
        bridgedUserId.current = null;
        useAuthStore.setState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
        storage.setUserId(null);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
};
