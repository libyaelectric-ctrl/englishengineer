import React from 'react';
import { cn } from '@/shared/utils/cn';

type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  tone?: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
  neutral: 'border-border-soft bg-surface text-muted-copy',
  info: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  danger: 'border-red-500/20 bg-red-500/10 text-red-400',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = 'neutral',
  className,
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
      toneClasses[tone],
      className
    )}
    {...props}
  >
    <span className="h-1 w-1 rounded-full bg-current opacity-80" />
    {label}
  </span>
);
