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
import { BillingSync } from '@/features/billing/BillingSync';
import { ThemeProvider } from '@/features/theme/ThemeProvider';

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<div>An error occurred. Please refresh the page.</div>}>
      <ThemeProvider>
        <AppProvider>
          {CLERK_PUBLISHABLE_KEY ? (
            <ClerkProvider
              publishableKey={CLERK_PUBLISHABLE_KEY}
              signInUrl={CLERK_SIGN_IN_URL}
              signUpUrl={CLERK_SIGN_UP_URL}
              signInFallbackRedirectUrl={CLERK_SIGN_IN_FALLBACK_REDIRECT_URL}
              signUpFallbackRedirectUrl={CLERK_SIGN_UP_FALLBACK_REDIRECT_URL}
            >
              <ClerkBridge />
              <BillingSync />
              <RouterProvider router={router} />
            </ClerkProvider>
          ) : (
            <>
              <BillingSync />
              <RouterProvider router={router} />
            </>
          )}
          <ToastContainer />
        </AppProvider>
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}
