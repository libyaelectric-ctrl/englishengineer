import { reportEnvironmentValidation } from '@/config/environment.config';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { initPoolSubscriptions } from '@/core/learning/learning.pool';

import { ErrorBoundaryProvider } from './ErrorBoundaryProvider';
import { QueryProvider } from './QueryProvider';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  useEffect(() => {
    reportEnvironmentValidation();
    initPoolSubscriptions();
  }, []);

  return (
    <ErrorBoundaryProvider>
      <QueryProvider>{children}</QueryProvider>
    </ErrorBoundaryProvider>
  );
};
