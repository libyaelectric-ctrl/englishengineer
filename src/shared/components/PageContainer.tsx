import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => (
  <div
    className={cn(
      'mx-auto min-h-full w-full max-w-5xl space-y-6 bg-background px-4 pb-10 pt-4 text-foreground animate-in fade-in duration-300 sm:px-6 lg:px-8',
      className
    )}
  >
    {children}
  </div>
);
