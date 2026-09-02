import { AppProvider } from '@/providers';
import { router } from '@/routes/router';
import { useCapacitorBackButton } from '@/shared/hooks/useCapacitorBackButton';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';
import { ClerkProvider } from '@clerk/clerk-react';
import * as Sentry from '@sentry/react';

import { Component, type ErrorInfo, type ReactNode, Suspense, lazy } from 'react';

import { RouterProvider } from 'react-router-dom';

import CookieConsentBanner from '@/shared/components/CookieConsentBanner';
import { ToastContainer } from '@/shared/components/Toast';
import { useDirection } from '@/shared/hooks/useDirection';

import { ClerkBridge } from '@/features/auth/ClerkBridge';
import {
  CLERK_PUBLISHABLE_KEY,
  CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_IN_URL,
  CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_UP_URL,
} from '@/features/auth/clerk.config';
import { getClerkTheme } from '@/features/auth/clerk.theme';
import { ThemeProvider, useTheme } from '@/features/theme/ThemeProvider';

const BillingSync = lazy(() =>
  import('@/features/billing/BillingSync').then((m) => ({ default: m.BillingSync }))
);

const ThemedClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY!}
      appearance={getClerkTheme(theme)}
      signInUrl={CLERK_SIGN_IN_URL ?? '/sign-in'}
      signUpUrl={CLERK_SIGN_UP_URL ?? '/sign-up'}
      signInFallbackRedirectUrl={CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? '/dashboard'}
      signUpFallbackRedirectUrl={CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? '/dashboard'}
      allowedRedirectOrigins={[
        'http://localhost',
        'https://localhost',
        'capacitor://localhost',
        'https://eng-vox.vercel.app',
        'https://engvox.com',
      ]}
    >
      {children}
    </ClerkProvider>
  );
};

class SimpleErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
            <h2>Something went wrong.</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => import('@/shared/utils/capacitor').then((m) => m.reloadApp())}>
              Refresh
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  useDirection();
  useCapacitorBackButton();
  usePushNotifications();

  return (
    <SimpleErrorBoundary fallback={<div>An error occurred. Please refresh the page.</div>}>
      <ThemeProvider>
        <AppProvider>
          <ThemedClerkProvider>
            <ClerkBridge />
            <Suspense fallback={null}>
              <BillingSync />
            </Suspense>
            <RouterProvider router={router} />
            <CookieConsentBanner />
          </ThemedClerkProvider>
          <ToastContainer />
        </AppProvider>
      </ThemeProvider>
    </SimpleErrorBoundary>
  );
};

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return <div>EngVox is not configured. Set CLERK_PUBLISHABLE_KEY to continue.</div>;
  }

  return <AppContent />;
}
