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
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    primary: 'bg-primary/10 text-primary border-primary/30',
  };

  return (
    <div
      className={cn(
        'mb-7 flex flex-col gap-4 border-b border-slate-200 pb-7 md:flex-row md:items-end md:justify-between',
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black text-slate-950 sm:text-4xl leading-tight">
            {title}
          </h1>
          {badgeText && (
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border',
                badgeColors[badgeColor]
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
        {description && (
          <p className="text-slate-600 font-medium text-sm sm:text-base max-w-3xl leading-relaxed">
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
