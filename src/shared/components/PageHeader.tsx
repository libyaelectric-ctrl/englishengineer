import React from 'react';
import { cn } from '@/shared/utils/cn';

export function PageHeader({ 
  title, 
  description, 
  icon,
  badgeText,
  badgeColor,
  actions,
  children
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
    <div className="mb-6 flex flex-col gap-1 border-b border-border-soft pb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border-soft text-xl shadow-sm">
            {icon}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {badgeText && (
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", badgeColor)}>
            {badgeText}
          </span>
        )}
      </div>
      <div className="flex justify-between items-start">
        {description && (
          <p className={cn("text-muted-copy text-sm max-w-2xl", icon && "ml-[52px]")}>
            {description}
          </p>
        )}
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
