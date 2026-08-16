import { reportEnvironmentValidation } from '@/config/environment.config';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { ErrorBoundaryProvider } from './ErrorBoundaryProvider';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  useEffect(() => {
    reportEnvironmentValidation();
    void import('@/core/learning/learning.pool').then(({ initPoolSubscriptions }) =>
      initPoolSubscriptions()
    );
  }, []);

  return <ErrorBoundaryProvider>{children}</ErrorBoundaryProvider>;
};
