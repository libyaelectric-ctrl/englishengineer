import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/router';
import { AppProvider } from '@/providers';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
};

export default App;
