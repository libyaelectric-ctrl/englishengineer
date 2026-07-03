import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Card } from './Card';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  statusColor?: 'primary' | 'emerald' | 'cyan' | 'amber' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  statusColor = 'primary',
  className,
  ...props
}) => {
  const iconColors = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    emerald: 'text-success bg-success/10 border-success/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    amber: 'text-warning bg-warning/10 border-warning/20',
    rose: 'text-error bg-error/10 border-error/20',
  };

  const trendTextColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-muted-copy',
  };

  return (
    <Card
      className={cn('group relative overflow-hidden', className)}
      {...props}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy">
            {label}
          </p>
          <h3 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold leading-tight tabular-nums text-foreground sm:text-2xl">
            {value}
          </h3>

          {trend && (
            <p
              className={cn(
                'flex min-w-0 items-start gap-1 break-words text-xs font-semibold',
                trendTextColors[trendDirection]
              )}
            >
              {trendDirection === 'up' && (
                <ArrowUpRight className="h-3.5 w-3.5" />
              )}
              {trendDirection === 'down' && (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            'shrink-0 rounded-[8px] border p-2 transition-all duration-300 group-hover:scale-[1.03]',
            iconColors[statusColor]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
};
