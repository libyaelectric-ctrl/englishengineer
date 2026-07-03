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
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-border-soft pb-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="rounded-[8px] border border-border-soft bg-surface-hover/50 p-2 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-foreground leading-tight">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-muted-copy mt-0.5 font-medium">
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
        <div className="mt-6 flex items-center justify-between border-t border-border-soft pt-6">
          {footer}
        </div>
      )}
    </Card>
  );
};
