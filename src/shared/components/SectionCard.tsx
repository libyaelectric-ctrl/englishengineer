import { type FC, type HTMLAttributes, type ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Card } from './Card';

interface SectionCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  headerActions?: ReactNode;
  footer?: ReactNode;
}

export const SectionCard: FC<SectionCardProps> = ({
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
    <Card className={cn('flex h-full flex-col p-5', className)} {...props}>
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-border-soft pb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-hover text-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-copy">{subtitle}</p>
            )}
          </div>
        </div>
        {headerActions && (
          <div className="flex items-center gap-2">{headerActions}</div>
        )}
      </div>

      <div className="flex-1">{children}</div>

      {footer && (
        <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-4">
          {footer}
        </div>
      )}
    </Card>
  );
};
