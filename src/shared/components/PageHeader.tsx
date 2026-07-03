import React from 'react';
import { cn } from '@/shared/utils/cn';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badgeText?: string;
  badgeColor?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'primary';
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badgeText,
  badgeColor = 'primary',
  actions,
  className,
  ...props
}) => {
  const badgeColors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-red-500/10 text-red-400 border-red-500/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <div
      className={cn(
        'mb-7 flex flex-col gap-4 border-b border-border-soft pb-7 md:flex-row md:items-end md:justify-between',
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl leading-tight">
            {title}
          </h1>
          {badgeText && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border',
                badgeColors[badgeColor]
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
        {description && (
          <p className="text-muted-copy font-medium text-xs sm:text-sm max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
          {actions}
        </div>
      )}
    </div>
  );
};
