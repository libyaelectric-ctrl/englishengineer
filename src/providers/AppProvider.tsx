import { reportEnvironmentValidation } from '@/config/environment.config';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { ErrorBoundaryProvider } from './ErrorBoundaryProvider';
import { QueryProvider } from './QueryProvider';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  useEffect(() => {
    reportEnvironmentValidation();
    // Deferred + dynamically imported (not a static top-level import): the
    // learning pool transitively pulls in the vocabulary/AI/billing services
    // and Supabase client. Loading it eagerly on every route — including the
    // anonymous landing page — put ~200KB of Supabase JS plus the whole
    // learning subsystem in the critical modulepreload graph for visitors
    // who haven't even signed up yet. requestIdleCallback + dynamic import
    // keeps it out of the initial chunk graph and fetches it only after the
    // page has painted, while still initializing before the user can
    // meaningfully interact with authenticated features.
    const idleId = requestIdleCallback(() => {
      import('@/core/learning/learning.pool').then(({ initPoolSubscriptions }) => {
        initPoolSubscriptions();
      });
    });
    return () => cancelIdleCallback(idleId);
  }, []);

  return (
    <ErrorBoundaryProvider>
      <QueryProvider>{children}</QueryProvider>
    </ErrorBoundaryProvider>
  );
};
