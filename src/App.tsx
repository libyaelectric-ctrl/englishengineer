import { AppProvider } from '@/providers';
import { router } from '@/routes/router';

import { RouterProvider } from 'react-router-dom';

import { ToastContainer } from '@/shared/components/Toast';

export const App = () => {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </AppProvider>
  );
};

export default App;
