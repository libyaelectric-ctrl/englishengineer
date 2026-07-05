import React from 'react';
import { cn } from '@/shared/utils/cn';

type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  tone?: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
  neutral: 'border-border-soft bg-surface text-muted-copy',
  info: 'border-primary/20 bg-primary/10 text-foreground',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  danger: 'border-error/20 bg-error/10 text-error',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = 'neutral',
  className,
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium',
      toneClasses[tone],
      className
    )}
    {...props}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {label}
  </span>
);
