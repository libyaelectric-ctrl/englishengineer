import { AppProvider } from '@/providers';
import { router } from '@/routes/router';
import * as Sentry from '@sentry/react';

import { RouterProvider } from 'react-router-dom';

import { ToastContainer } from '@/shared/components/Toast';
import { YiboMascot } from '@/shared/components/YiboMascot';

import { ThemeProvider } from '@/features/theme/ThemeProvider';

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<div>An error occurred. Please refresh the page.</div>}>
      <ThemeProvider>
        <AppProvider>
          <RouterProvider router={router} />
          <ToastContainer />
          <YiboMascot />
        </AppProvider>
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}
