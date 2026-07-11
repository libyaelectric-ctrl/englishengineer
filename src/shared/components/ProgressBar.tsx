import { type FC, type HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showValue?: boolean;
  animated?: boolean;
  color?:
    | 'primary'
    | 'cyan'
    | 'emerald'
    | 'rose'
    | 'amber'
    | 'success'
    | 'warning'
    | 'danger';
}

export const ProgressBar: FC<ProgressBarProps> = ({
  value,
  max = 100,
  showValue = false,
  animated = true,
  color = 'primary',
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    primary: 'bg-foreground',
    cyan: 'bg-primary',
    emerald: 'bg-success',
    rose: 'bg-error',
    amber: 'bg-warning',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-error',
  };

  return (
    <div className={cn('w-full space-y-1', className)} {...props}>
      {showValue && (
        <div className="flex justify-between text-[10px] text-muted-copy">
          <span>Progress</span>
          <span className="font-medium text-foreground">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-soft">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
