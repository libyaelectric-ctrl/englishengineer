import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Card } from './Card';

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  headerActions,
  footer,
  children,
  className,
  ...props
}) => {
  return (
    <Card className={cn('flex h-full flex-col', className)} {...props}>
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="rounded-[12px] border border-blue-100 bg-blue-50 p-2.5 text-blue-700">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h4 className="text-lg font-bold text-slate-900 leading-tight">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {headerActions && (
          <div className="flex items-center gap-2">{headerActions}</div>
        )}
      </div>

      <div className="flex-1">{children}</div>

      {footer && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
          {footer}
        </div>
      )}
    </Card>
  );
};
