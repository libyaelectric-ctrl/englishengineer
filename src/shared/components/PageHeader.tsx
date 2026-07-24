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
    <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/95 backdrop-blur-xl mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-surface border border-border-soft text-base shadow-sm">
            {icon}
          </div>
        )}
        <h1 className="text-base font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {badgeText && (
          <span
            className={cn(
              'rounded-[4px] border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
              badgeColor || 'border-border-soft bg-surface text-[#0047bb]'
            )}
          >
            {badgeText}
          </span>
        )}
        {description && (
          <p className="hidden text-[11px] font-medium text-muted-copy leading-tight sm:block">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="shrink-0 flex items-center gap-2">{actions}</div>
      )}
      {children}
    </div>
  );
}
