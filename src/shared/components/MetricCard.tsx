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
  statusColor?:
    | 'primary'
    | 'emerald'
    | 'cyan'
    | 'amber'
    | 'rose'
    | 'success'
    | 'warning'
    | 'danger';
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
    primary: 'text-foreground bg-surface-hover',
    emerald: 'text-success bg-success/10',
    cyan: 'text-primary bg-primary/10',
    amber: 'text-warning bg-warning/10',
    rose: 'text-error bg-error/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-error bg-error/10',
  };

  const trendTextColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-muted-copy',
  };

  return (
    <Card
      className={cn('group relative overflow-hidden p-5', className)}
      {...props}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs text-muted-copy">{label}</p>
          <h3 className="text-2xl font-bold text-foreground tabular-nums">
            {value}
          </h3>
          {trend && (
            <p
              className={cn(
                'flex items-center gap-1 text-xs',
                trendTextColors[trendDirection]
              )}
            >
              {trendDirection === 'up' && <ArrowUpRight className="h-3 w-3" />}
              {trendDirection === 'down' && (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            iconColors[statusColor]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};
