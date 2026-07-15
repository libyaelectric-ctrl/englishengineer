import React, { useEffect } from 'react';
import { ErrorBoundaryProvider } from './ErrorBoundaryProvider';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { CloudSyncService, useAuthStore } from '@/features/auth';
import { reportEnvironmentValidation } from '@/config/environment.config';
import { logger } from '@/shared/logger';
import { STORAGE_CHANGE_EVENT } from '@/shared/storage';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const providerMode = useAuthStore((state) => state.providerMode);

  useEffect(() => {
    reportEnvironmentValidation();
  }, []);

  useEffect(() => {
    if (providerMode !== 'supabase' || !currentUser) {
      return undefined;
    }

    let syncTimer: number | undefined;

    const runSync = (reason: 'online-return' | 'local-change') => {
      CloudSyncService.queueSync(reason, currentUser.id)
        .then(() => CloudSyncService.flushQueue(currentUser.id))
        .catch((error: unknown) => {
          logger.w(`[CLOUD SYNC] ${reason} sync failed.`, error);
        });
    };

    const syncWhenOnline = () => runSync('online-return');

    const scheduleLocalChangeSync = (event: Event) => {
      const storageKey = (event as CustomEvent<{ key?: string }>).detail?.key;
      if (
        !storageKey ||
        !CloudSyncService.isSyncableStorageKey(storageKey, currentUser.id)
      ) {
        return;
      }
      if (syncTimer !== undefined) window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(() => runSync('local-change'), 1_500);
    };

    window.addEventListener('online', syncWhenOnline);
    window.addEventListener(STORAGE_CHANGE_EVENT, scheduleLocalChangeSync);
    if (navigator.onLine) {
      syncWhenOnline();
    }

    return () => {
      window.removeEventListener('online', syncWhenOnline);
      window.removeEventListener(STORAGE_CHANGE_EVENT, scheduleLocalChangeSync);
      if (syncTimer !== undefined) window.clearTimeout(syncTimer);
    };
  }, [currentUser, providerMode]);

  return (
    <ErrorBoundaryProvider>
      <QueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryProvider>
    </ErrorBoundaryProvider>
  );
};
