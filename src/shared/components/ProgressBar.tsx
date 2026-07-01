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
    primary: 'bg-blue-600',
    cyan: 'bg-cyan-600',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
    amber: 'bg-amber-500',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {showValue && (
        <div className="flex justify-between text-[11px] font-mono uppercase tracking-widest text-slate-500">
          <span>PROGRESS</span>
          <span className="font-bold text-slate-700">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            colors[color],
            animated &&
              'relative after:absolute after:inset-y-0 after:right-0 after:w-6 after:bg-white/25 after:blur-sm'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
