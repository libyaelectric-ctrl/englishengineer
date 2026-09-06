/**
 * Firebase Auth provider + hooks.
 *
 * Replaces the Clerk provider stack. The context exposes the same shape the
 * rest of the app already consumes (isLoaded / isSignedIn / getIdToken /
 * signOut) so <FirebaseBridge>, <AuthGuard> and the auth pages stay simple.
 *
 * Google sign-in strategy:
 * - Web: signInWithPopup (Google's own consent window).
 * - Native (Capacitor APK): @capacitor-firebase/authentication performs a
 *   NATIVE Google sign-in (Play Services / Credential Manager) and hands the
 *   ID token back to the Firebase web SDK via signInWithCredential. No
 *   embedded WebView, no custom-scheme deep links, no Clerk-style origin
 *   restrictions — this is what makes login work inside the APK.
 */
import { type FirebaseApp, initializeApp } from 'firebase/app';
import {
  type Auth,
  GoogleAuthProvider,
  type User,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { logger } from '@/shared/logger';
import { isNativePlatform } from '@/shared/utils/capacitor';

import { FIREBASE_CONFIG } from './firebase.config';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

const getFirebaseAuth = (): Auth | null => {
  if (!FIREBASE_CONFIG) return null;
  if (!firebaseAuth) {
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    firebaseAuth = getAuth(firebaseApp);
  }
  return firebaseAuth;
};

export interface FirebaseAuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(null);

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useMemo(() => getFirebaseAuth(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(!auth);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoaded(true);
    });
  }, [auth]);

  useEffect(() => {
    if (!auth) return;
    // Completes a signInWithRedirect() started by the popup-fallback below
    // (e.g. after a blocked popup or a third-party-storage issue). Also
    // surfaces the underlying error if the redirect itself failed, instead
    // of the page silently landing back on the sign-in screen.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          logger.i('[FirebaseAuth] Redirect sign-in completed for', result.user.uid);
        }
      })
      .catch((err) => {
        logger.e('[FirebaseAuth] Redirect sign-in failed:', err);
      });
  }, [auth]);

  const value = useMemo<FirebaseAuthContextValue>(
    () => ({
      isLoaded,
      isSignedIn: Boolean(user),
      user,
      getIdToken: async (forceRefresh?: boolean) => {
        if (!user) return null;
        return user.getIdToken(forceRefresh);
      },
      signOut: async () => {
        if (!auth) return;
        await firebaseSignOut(auth);
        if (isNativePlatform()) {
          try {
            const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
            await FirebaseAuthentication.signOut();
          } catch {
            // Native plugin unavailable (web build / missing google-services.json)
            // — the web sign-out above already cleared the session.
          }
        }
      },
      signInWithGoogle: async () => {
        if (!auth) throw new Error('Firebase is not configured.');
        if (isNativePlatform()) {
          const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
          const result = await FirebaseAuthentication.signInWithGoogle();
          const idToken = result.credential?.idToken;
          if (!idToken) {
            throw new Error('Google sign-in did not return an ID token.');
          }
          await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
          return;
        }
        await signInWithPopup(auth, new GoogleAuthProvider());
      },
      signInWithGoogleRedirect: async () => {
        if (!auth) throw new Error('Firebase is not configured.');
        // Full-page redirect fallback for browsers/environments where the
        // popup's authDomain iframe (used to relay the result back) is
        // blocked — this navigates away and back, and getRedirectResult()
        // above picks up the outcome on return.
        await signInWithRedirect(auth, new GoogleAuthProvider());
      },
      signInWithEmail: async (email: string, password: string) => {
        if (!auth) throw new Error('Firebase is not configured.');
        await signInWithEmailAndPassword(auth, email, password);
      },
      signUpWithEmail: async (email: string, password: string, displayName?: string) => {
        if (!auth) throw new Error('Firebase is not configured.');
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await firebaseUpdateProfile(credential.user, { displayName });
        }
      },
    }),
    [auth, isLoaded, user]
  );

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
};

export const useFirebaseAuth = (): FirebaseAuthContextValue => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    // Provider not mounted (unit tests, misconfigured boot): behave like a
    // loaded-but-signed-out session so guards fall back to demo/local auth.
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
      getIdToken: async () => null,
      signOut: async () => {},
      signInWithGoogle: async () => {
        throw new Error('Firebase Auth provider is not mounted.');
      },
      signInWithGoogleRedirect: async () => {
        throw new Error('Firebase Auth provider is not mounted.');
      },
      signInWithEmail: async () => {
        throw new Error('Firebase Auth provider is not mounted.');
      },
      signUpWithEmail: async () => {
        throw new Error('Firebase Auth provider is not mounted.');
      },
    };
  }
  return context;
};
