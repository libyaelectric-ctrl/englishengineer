import { AppProvider } from '@/providers';
import { router } from '@/routes/router';
import { ClerkProvider } from '@clerk/clerk-react';
import * as Sentry from '@sentry/react';

import { RouterProvider } from 'react-router-dom';

import { ToastContainer } from '@/shared/components/Toast';

import { ClerkBridge } from '@/features/auth/ClerkBridge';
import { CLERK_PUBLISHABLE_KEY } from '@/features/auth/clerk.config';
import { ThemeProvider } from '@/features/theme/ThemeProvider';

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<div>An error occurred. Please refresh the page.</div>}>
      <ThemeProvider>
        <AppProvider>
          {CLERK_PUBLISHABLE_KEY ? (
            <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
              <ClerkBridge />
              <RouterProvider router={router} />
            </ClerkProvider>
          ) : (
            <RouterProvider router={router} />
          )}
          <ToastContainer />
        </AppProvider>
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}
