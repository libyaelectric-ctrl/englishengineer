import { AppProvider, ErrorBoundaryProvider } from '@/providers';
import { router } from '@/routes/router';
import { Analytics } from '@vercel/analytics/react';

import { Suspense, lazy } from 'react';

import { RouterProvider } from 'react-router-dom';

import CookieConsentBanner from '@/shared/components/CookieConsentBanner';
import { ToastContainer } from '@/shared/components/Toast';
import { useCapacitorBackButton } from '@/shared/hooks/useCapacitorBackButton';
import { useDirection } from '@/shared/hooks/useDirection';

import { FirebaseAuthProvider } from '@/features/auth/FirebaseAuth';
import { FirebaseBridge } from '@/features/auth/FirebaseBridge';
import { SessionDataBridge } from '@/features/auth/SessionDataBridge';
import { ThemeProvider } from '@/features/theme/ThemeProvider';

const BillingSync = lazy(() =>
  import('@/features/billing/BillingSync').then((module) => ({ default: module.BillingSync }))
);
const AppContent = () => {
  useDirection();
  useCapacitorBackButton();
  return (
    <ThemeProvider>
      <AppProvider>
        <FirebaseAuthProvider>
          <SessionDataBridge />
          <FirebaseBridge />
          <Suspense fallback={null}>
            <BillingSync />
          </Suspense>
          <RouterProvider router={router} />
          <CookieConsentBanner />
        </FirebaseAuthProvider>
        <ToastContainer />
        <Analytics />
      </AppProvider>
    </ThemeProvider>
  );
};
export default function App() {
  return (
    <ErrorBoundaryProvider>
      <AppContent />
    </ErrorBoundaryProvider>
  );
}
