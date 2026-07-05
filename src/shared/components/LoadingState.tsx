import React from 'react';
import { Skeleton } from './Skeleton';

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = () => (
  <div className="min-h-[60vh] w-full px-4 py-10">
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
      <div className="space-y-3">
        <Skeleton className="w-2/3" />
        <Skeleton className="w-full" />
        <Skeleton className="w-5/6" />
      </div>
    </div>
  </div>
);
