import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/router';
import { AppProvider } from '@/providers';
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
