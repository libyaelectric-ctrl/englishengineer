import { type FC } from 'react';

import { Skeleton } from './Skeleton';

interface LoadingStateProps {
  title?: string;
  description?: string;
  /** When 'error', renders a distinct retry UI instead of skeleton placeholders. */
  variant?: 'default' | 'error';
}

export const LoadingState: FC<LoadingStateProps> = ({ title, description, variant = 'default' }) => (
  <div
    className="min-h-[60vh] w-full px-4 py-10"
    role="status"
    aria-busy={variant === 'default'}
    aria-label="Loading content"
  >
    <div className="mx-auto max-w-5xl space-y-6">
      {variant === 'error' ? (
        <div className="flex flex-col items-center justify-center gap-4 pt-8 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {title ?? 'Connection problem'}
          </h2>
          <p className="max-w-sm text-sm text-muted-copy">
            {description ??
              'Unable to reach the authentication service. This is usually caused by an ad blocker or privacy extension. Please disable it for this site and reload the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {title ? (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            ) : (
              <Skeleton className="h-6 w-48" />
            )}
            {description ? (
              <p className="text-sm text-muted-copy">{description}</p>
            ) : (
              <Skeleton className="h-4 w-64" />
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-3">
            <Skeleton className="w-2/3" />
            <Skeleton className="w-full" />
            <Skeleton className="w-5/6" />
          </div>
        </>
      )}
    </div>
  </div>
);
