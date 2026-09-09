import React from 'react';

import { cn } from '@/shared/utils/cn';

export function PageHeader({
  title,
  description,
  icon,
  badgeText,
  badgeColor,
  actions,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  badgeColor?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-border-soft bg-background/95 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-soft bg-surface text-base shadow-sm">
            {icon}
          </div>
        )}
        <h1 className="truncate text-base font-black tracking-tight text-foreground sm:text-lg">
          {title}
        </h1>
        {badgeText && (
          <span
            className={cn(
              'hidden rounded-[var(--radius-button)] border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline',
              badgeColor || 'border-border-soft bg-surface text-primary'
            )}
          >
            {badgeText}
          </span>
        )}
        {description && (
          <p className="hidden max-w-xl truncate text-[11px] font-semibold leading-tight text-muted-copy xl:block">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="scrollbar-none flex max-w-[58vw] shrink-0 items-center gap-1.5 overflow-x-auto py-1 sm:max-w-none sm:gap-2">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
