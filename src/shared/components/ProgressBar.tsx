import React from 'react';
import { cn } from '@/shared/utils/cn';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  showValue?: boolean;
  animated?: boolean;
  color?: 'primary' | 'cyan' | 'emerald' | 'rose' | 'amber';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
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
    primary: 'bg-primary',
    cyan: 'bg-cyan-500',
    emerald: 'bg-success',
    rose: 'bg-error',
    amber: 'bg-warning',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {showValue && (
        <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-muted-copy">
          <span>PROGRESS</span>
          <span className="font-bold text-foreground">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-soft">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            colors[color],
            animated &&
              'relative after:absolute after:inset-y-0 after:right-0 after:w-6 after:bg-white/10 after:blur-sm'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
