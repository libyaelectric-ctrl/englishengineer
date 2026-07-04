import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export const RouteErrorPage = () => {
  const error = useRouteError();
  
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'The requested page could not be loaded.';

  // Auto-reload the page if a chunk loading error occurs due to a new deployment
  if (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed')
  ) {
    window.location.reload();
    return null;
  }
  return (
    <main className="mx-auto mt-16 max-w-xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-black text-slate-950">Route unavailable</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      <Link
        to="/dashboard"
        className="mt-5 inline-flex rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white"
      >
        Return Home
      </Link>
    </main>
  );
};
