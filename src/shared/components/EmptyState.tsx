import { type FC, type HTMLAttributes } from 'react';
import { LucideIcon, Radio } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from './Button';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Radio,
  actionText,
  onAction,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border-soft bg-surface p-12 text-center',
        className
      )}
      {...props}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover text-muted-copy">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-copy max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button
          variant="secondary"
          onClick={onAction}
          className="mt-4 h-9 px-4 text-xs"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
