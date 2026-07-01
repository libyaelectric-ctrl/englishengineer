import React from 'react';
import { Cpu } from 'lucide-react';
import { Skeleton } from './Skeleton';

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Preparing workspace',
  description = 'Loading the latest local learning state.',
}) => (
  <div className="min-h-[60vh] w-full animate-aurora-fade-in px-4 py-10">
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="premium-panel flex items-center gap-4 p-5">
        <div className="rounded-[12px] border border-blue-100 bg-blue-50 p-3 text-blue-700">
          <Cpu className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
      <div className="premium-surface space-y-3 p-5">
        <Skeleton className="w-2/3" />
        <Skeleton className="w-full" />
        <Skeleton className="w-5/6" />
      </div>
    </div>
  </div>
);
