import { AppProvider } from '@/providers';
import { router } from '@/routes/router';
import { Analytics } from '@vercel/analytics/react';

import { Component, type ErrorInfo, type ReactNode, Suspense, lazy } from 'react';

import { RouterProvider } from 'react-router-dom';

import CookieConsentBanner from '@/shared/components/CookieConsentBanner';
import { ToastContainer } from '@/shared/components/Toast';
import { useCapacitorBackButton } from '@/shared/hooks/useCapacitorBackButton';
import { useDirection } from '@/shared/hooks/useDirection';
import { logger } from '@/shared/logger';

import { FirebaseAuthProvider } from '@/features/auth/FirebaseAuth';
import { FirebaseBridge } from '@/features/auth/FirebaseBridge';
import { ThemeProvider } from '@/features/theme/ThemeProvider';

const BillingSync = lazy(() =>
  import('@/features/billing/BillingSync').then((m) => ({ default: m.BillingSync }))
);

class SimpleErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.e('[ErrorBoundary]', error, info.componentStack);
    import('@sentry/react').then((m) => m.captureException(error)).catch(() => {});
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

  return (
    <SimpleErrorBoundary fallback={<div>An error occurred. Please refresh the page.</div>}>
      <ThemeProvider>
        <AppProvider>
          <FirebaseAuthProvider>
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
    </SimpleErrorBoundary>
  );
};

export default function App() {
  return (
    <SimpleErrorBoundary
      fallback={
        <div
          style={{
            padding: 24,
            fontFamily: 'sans-serif',
            background: '#0f0f23',
            color: '#fff',
            minHeight: '100vh',
          }}
        >
          <h2>EngVox Startup Notice</h2>
          <p>An unexpected error occurred while starting the application.</p>
          <button
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              marginTop: 16,
            }}
            onClick={() => import('@/shared/utils/capacitor').then((m) => m.reloadApp())}
          >
            Refresh App
          </button>
        </div>
      }
    >
      <AppContent />
    </SimpleErrorBoundary>
  );
}
