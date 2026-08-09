import { AlertTriangle } from 'lucide-react';

import { useEffect, useRef } from 'react';

import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { Button } from '@/shared/components/Button';
import { logger } from '@/shared/logger';

const CHUNK_ERROR_MESSAGES = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
];
const MAX_RELOAD_ATTEMPTS = 3;
const RELOAD_KEY = 'engvox_chunk_reload_attempts';

export const RouteErrorPage = () => {
  const error = useRouteError();
  const reloadCountRef = useRef(0);

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'The requested page could not be loaded.';

  const isChunkError = CHUNK_ERROR_MESSAGES.some((msg) => message.includes(msg));

  useEffect(() => {
    if (!isChunkError) return;
    try {
      reloadCountRef.current = parseInt(sessionStorage.getItem(RELOAD_KEY) || '0', 10);
    } catch (e) {
      logger.w('[RouteError] Failed to read reload count from sessionStorage', e);
      reloadCountRef.current = 0;
    }
    if (reloadCountRef.current < MAX_RELOAD_ATTEMPTS) {
      try {
        sessionStorage.setItem(RELOAD_KEY, String(reloadCountRef.current + 1));
      } catch (e) {
        logger.w('[RouteError] Failed to write reload count to sessionStorage', e);
      }
      const delay = Math.min(1000 * 2 ** reloadCountRef.current, 8000);
      const timer = setTimeout(() => window.location.reload(), delay);
      return () => clearTimeout(timer);
    }
    try {
      sessionStorage.removeItem(RELOAD_KEY);
    } catch (e) {
      logger.w('[RouteError] Failed to remove reload count from sessionStorage', e);
    }
  }, [isChunkError]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="p-6 bg-surface-hover rounded-[var(--radius-card)] mb-8 text-muted-copy">
        <AlertTriangle className="h-16 w-16" />
      </div>
      <h1 className="text-6xl font-medium tracking-tighter">SYSTEM FAULT</h1>
      <p className="text-muted-copy mt-4 max-w-md text-lg">{message}</p>
      <Link to="/dashboard" className="mt-12">
        <Button variant="outline" className="gap-3 px-8 h-14 text-lg rounded-[var(--radius-card)]">
          Return to Command Center
        </Button>
      </Link>
    </div>
  );
};
