import React from 'react';
import { cn } from '@/shared/utils/cn';

export function PageHeader({ 
  title, 
  description, 
  icon,
  badgeText,
  badgeColor,
  actions,
  isSticky = true,
  children
}: { 
  title: string; 
  description?: string; 
  icon?: React.ReactNode;
  badgeText?: string;
  badgeColor?: string;
  actions?: React.ReactNode;
  isSticky?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn(
      "mb-6 flex flex-col gap-1 border-b border-border-soft pb-4",
      isSticky && "sticky top-0 z-30 bg-background -mt-12 pt-12 sm:-mt-12 sm:pt-12 lg:-mt-4 lg:pt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    )}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border-soft text-xl shadow-sm">
            {icon}
          </div>
        )}
        <h1 className="text-2xl font-black tracking-tight text-foreground">{title}</h1>
        {badgeText && (
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", badgeColor)}>
            {badgeText}
          </span>
        )}
      </div>
      {(description || actions) && (
        <div className="flex justify-between items-start mt-2">
          {description && (
            <p className={cn("text-muted-copy text-sm max-w-2xl", icon && "ml-[52px]")}>
              {description}
            </p>
          )}
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
