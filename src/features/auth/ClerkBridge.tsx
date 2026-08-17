import { useAuth, useUser } from '@clerk/clerk-react';

import { useEffect, useRef } from 'react';

import { storage } from '@/shared/storage';

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

/**
 * Keeps the app's zustand auth store in sync with the Clerk session so that
 * routes guarded by <AuthGuard> recognize a Clerk sign-in. The existing
 * Supabase/local auth flow is left untouched: the bridge only seeds the store
 * while no other provider owns the session, and it only clears a user that it
 * bridged itself.
 */
export const ClerkBridge = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const bridgedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const state = useAuthStore.getState();

    if (isSignedIn && user) {
      // Only take ownership when the app is not already signed in through
      // another provider, or when the current user is the same Clerk user.
      const alreadyMine = state.currentUser?.id === user.id;
      if (!state.isAuthenticated || alreadyMine) {
        if (!alreadyMine) {
          useAuthStore.setState({
            currentUser: buildProfile(user),
            isAuthenticated: true,
            isLoading: false,
          });
          storage.setUserId(user.id);
        }
        bridgedUserId.current = user.id;
      }
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
