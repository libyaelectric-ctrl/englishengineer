import { AppProvider } from '@/providers';
import { router } from '@/routes/router';
import * as Sentry from '@sentry/react';

import { RouterProvider } from 'react-router-dom';

import { ToastContainer } from '@/shared/components/Toast';

export const App = () => {
  return (
    <Sentry.ErrorBoundary fallback={<div>An error occurred. Please refresh the page.</div>}>
      <AppProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </AppProvider>
    </Sentry.ErrorBoundary>
  );
};

export default App;
