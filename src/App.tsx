import { AppProvider } from '@/providers';
import { router } from '@/routes/router';
import { ClerkProvider } from '@clerk/clerk-react';
import * as Sentry from '@sentry/react';

import { RouterProvider } from 'react-router-dom';

import { ToastContainer } from '@/shared/components/Toast';

import { ClerkBridge } from '@/features/auth/ClerkBridge';
import {
  CLERK_PUBLISHABLE_KEY,
  CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_IN_URL,
  CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_UP_URL,
} from '@/features/auth/clerk.config';
import { CLERK_THEME } from '@/features/auth/clerk.theme';
import { BillingSync } from '@/features/billing/BillingSync';
import { ThemeProvider } from '@/features/theme/ThemeProvider';

export default function App() {
  // Clerk is the single auth of record: without the publishable key there is
  // no app to render, so surface a clear configuration error instead of
  // silently falling back to a legacy auth path.
  if (!CLERK_PUBLISHABLE_KEY) {
    return <div>EngVox is not configured. Set CLERK_PUBLISHABLE_KEY to continue.</div>;
  }

  return (
    <Sentry.ErrorBoundary fallback={<div>An error occurred. Please refresh the page.</div>}>
      <ThemeProvider>
        <AppProvider>
          <ClerkProvider
            publishableKey={CLERK_PUBLISHABLE_KEY}
            appearance={CLERK_THEME}
            signInUrl={CLERK_SIGN_IN_URL}
            signUpUrl={CLERK_SIGN_UP_URL}
            signInFallbackRedirectUrl={CLERK_SIGN_IN_FALLBACK_REDIRECT_URL}
            signUpFallbackRedirectUrl={CLERK_SIGN_UP_FALLBACK_REDIRECT_URL}
          >
            <ClerkBridge />
            <BillingSync />
            <RouterProvider router={router} />
          </ClerkProvider>
          <ToastContainer />
        </AppProvider>
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}
