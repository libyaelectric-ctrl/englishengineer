import React from 'react';
import { cn } from '@/shared/utils/cn';

type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  tone?: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = 'neutral',
  className,
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]',
      toneClasses[tone],
      className
    )}
    {...props}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
    {label}
  </span>
);
