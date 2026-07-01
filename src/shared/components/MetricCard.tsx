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
    primary: 'text-blue-700 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    cyan: 'text-cyan-700 bg-cyan-50 border-cyan-100',
    amber: 'text-amber-700 bg-amber-50 border-amber-100',
    rose: 'text-rose-700 bg-rose-50 border-rose-100',
  };

  const trendTextColors = {
    up: 'text-emerald-500',
    down: 'text-rose-500',
    neutral: 'text-slate-500',
  };

  return (
    <Card
      className={cn('group relative overflow-hidden', className)}
      {...props}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {label}
          </p>
          <h3 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-black leading-tight tabular-nums text-slate-950 sm:text-3xl">
            {value}
          </h3>

          {trend && (
            <p
              className={cn(
                'flex min-w-0 items-start gap-1 break-words text-xs font-bold',
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
            'shrink-0 rounded-[12px] border p-2.5 transition-all duration-300 group-hover:scale-[1.03]',
            iconColors[statusColor]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};
