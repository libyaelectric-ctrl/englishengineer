import * as Sentry from '@sentry/react';
import { AppProvider } from '@/providers';
import { router } from '@/routes/router';

import { RouterProvider } from 'react-router-dom';

import { ToastContainer } from '@/shared/components/Toast';

export const App = () => {
  return (
    <Sentry.ErrorBoundary fallback={<div>Bir hata oluştu. Lütfen sayfayı yenileyin.</div>}>
      <AppProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </AppProvider>
    </Sentry.ErrorBoundary>
  );
};

export default App;
