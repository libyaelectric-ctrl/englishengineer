import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/router';
import { AppProvider } from '@/providers';
import { Mascot } from '@/components/Mascot';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <div className="fixed bottom-4 right-4 z-50">
        <Mascot size={80} />
      </div>
    </AppProvider>
  );
};

export default App;
