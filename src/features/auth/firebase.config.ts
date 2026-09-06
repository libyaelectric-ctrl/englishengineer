// Client-side Firebase configuration.
//
// Firebase web API keys are public by design (like Clerk publishable keys):
// they are embedded in the client bundle and visible to end users. Security
// comes from Firebase Auth domain restrictions + Security Rules, not from
// hiding this key. The fallback values keep APK builds working even when the
// build environment lacks .env files; env vars override them when present.

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId?: string;
}

const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

const FALLBACK_CONFIG: FirebaseAppConfig = {
  apiKey: 'AIzaSyBXAc7YpHtAfCP41pfH6-KF-ByHorZba4w',
  authDomain: 'engvox-59b85.firebaseapp.com',
  projectId: 'engvox-59b85',
};

export const FIREBASE_CONFIG: FirebaseAppConfig | null =
  envApiKey && envProjectId
    ? {
        apiKey: envApiKey,
        authDomain: envAuthDomain || `${envProjectId}.firebaseapp.com`,
        projectId: envProjectId,
        appId: envAppId,
      }
    : FALLBACK_CONFIG;

export const AUTH_SIGN_IN_URL = import.meta.env.VITE_AUTH_SIGN_IN_URL || '/sign-in';

export const AUTH_SIGN_UP_URL = import.meta.env.VITE_AUTH_SIGN_UP_URL || '/sign-up';

export const AUTH_SIGN_IN_FALLBACK_REDIRECT_URL =
  import.meta.env.VITE_AUTH_SIGN_IN_FALLBACK_REDIRECT_URL || '/dashboard';

export const AUTH_SIGN_UP_FALLBACK_REDIRECT_URL =
  import.meta.env.VITE_AUTH_SIGN_UP_FALLBACK_REDIRECT_URL || '/dashboard';
