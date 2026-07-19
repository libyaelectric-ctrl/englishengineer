import React from 'react';
import { cn } from '@/shared/utils/cn';

/**
 * Sticky page top bar — height matches the sidebar EngVox header (h-16 = 64px).
 * Use this in every authenticated page to keep the layout perfectly aligned.
 */
export function PageTopBar({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'sticky top-0 z-40',
        'flex h-16 shrink-0 items-center justify-between',
        'border-b border-border-soft bg-background/90 backdrop-blur-xl',
        '-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate text-base font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[11px] font-medium text-muted-copy leading-tight">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="ml-4 flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
