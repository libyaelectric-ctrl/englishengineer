import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => (
  <div
    className={cn(
      'mx-auto max-w-5xl space-y-6 min-h-screen bg-background pb-16 text-foreground animate-in fade-in duration-300',
      className
    )}
  >
    {children}
  </div>
);
