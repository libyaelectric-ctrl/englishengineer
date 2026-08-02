import { useEffect, useRef } from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
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
    <main className="mx-auto mt-16 max-w-xl rounded-2xl border border-rose-200 bg-surface p-8 text-center shadow-sm">
      <h1 className="text-2xl font-black text-foreground">Route unavailable</h1>
      <p className="mt-3 text-sm leading-6 text-muted-copy">{message}</p>
      <Link
        to="/dashboard"
        className="mt-5 inline-flex rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white"
      >
        Return Home
      </Link>
    </main>
  );
};
