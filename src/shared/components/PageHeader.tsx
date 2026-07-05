import React from 'react';
import { cn } from '@/shared/utils/cn';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badgeText?: string;
  badgeColor?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'primary' | 'success' | 'warning' | 'danger';
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
    emerald: 'border-success/20 bg-success/10 text-success',
    cyan: 'border-primary/20 bg-primary/10 text-foreground',
    amber: 'border-warning/20 bg-warning/10 text-warning',
    rose: 'border-error/20 bg-error/10 text-error',
    primary: 'border-border-soft bg-surface text-foreground',
    success: 'border-success/20 bg-success/10 text-success',
    warning: 'border-warning/20 bg-warning/10 text-warning',
    danger: 'border-error/20 bg-error/10 text-error',
  };

  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 border-b border-border-soft pb-6 md:flex-row md:items-end md:justify-between',
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            {title}
          </h1>
          {badgeText && (
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                badgeColors[badgeColor]
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-copy max-w-3xl leading-relaxed">
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
