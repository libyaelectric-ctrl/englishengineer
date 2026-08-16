import { ArrowDownRight, ArrowUpRight, LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

import { memo } from 'react';

import { cardHover, countUp, iconHover } from '@/shared/motion/variants';
import { cn } from '@/shared/utils/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  statusColor?:
    'primary' | 'emerald' | 'cyan' | 'amber' | 'rose' | 'success' | 'warning' | 'danger';
  className?: string;
  style?: React.CSSProperties;
}

export const MetricCard = memo<MetricCardProps>(
  ({
    label,
    value,
    icon: Icon,
    trend,
    trendDirection = 'up',
    statusColor = 'primary',
    className,
    style,
  }) => {
    const iconColors: Record<string, string> = {
      primary: 'text-foreground bg-surface-hover',
      emerald: 'text-success bg-success/10',
      cyan: 'text-primary bg-primary/10',
      amber: 'text-warning bg-warning/10',
      rose: 'text-error bg-error/10',
      success: 'text-success bg-success/10',
      warning: 'text-warning bg-warning/10',
      danger: 'text-error bg-error/10',
    };

    const trendTextColors: Record<string, string> = {
      up: 'text-success',
      down: 'text-error',
      neutral: 'text-muted-copy',
    };

    return (
      <motion.div
        variants={cardHover}
        whileHover="hover"
        whileTap="tap"
        className={cn('group relative overflow-hidden p-5', className)}
        style={style}
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs text-muted-copy">{label}</p>
            <motion.h3
              variants={countUp}
              className="text-2xl font-bold text-foreground tabular-nums"
            >
              {value}
            </motion.h3>
            {trend && (
              <motion.p
                className={cn('flex items-center gap-1 text-xs', trendTextColors[trendDirection])}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {trendDirection === 'up' && (
                  <motion.span
                    variants={iconHover}
                    animate={{ rotate: [-10, 10, -10] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                  </motion.span>
                )}
                {trendDirection === 'down' && (
                  <motion.span
                    variants={iconHover}
                    animate={{ rotate: [10, -10, 10] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowDownRight className="h-3 w-3" />
                  </motion.span>
                )}
                {trend}
              </motion.p>
            )}
          </div>
          <motion.div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[4px]',
              iconColors[statusColor]
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <motion.span variants={iconHover} whileHover="hover" whileTap="tap">
              <Icon className="h-5 w-5" />
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

MetricCard.displayName = 'MetricCard';
