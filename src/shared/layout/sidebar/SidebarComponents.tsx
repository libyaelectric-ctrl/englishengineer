import React, { useState } from 'react';
import { cn } from '@/shared/utils/cn';

export function Section({
  title,
  children,
  open = true,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  const [expanded, setExpanded] = useState(open);
  return (
    <div className="border-b border-border-soft">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-surface-hover/50 transition-colors"
      >
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-copy">
          {title}
        </h3>
        <svg
          className={cn(
            'h-3 w-3 text-muted-copy transition-transform',
            expanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

export function Item({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-all duration-150 cursor-pointer',
        active
          ? 'bg-foreground text-background font-medium'
          : 'text-muted-copy hover:bg-surface-hover hover:text-foreground hover:translate-x-0.5'
      )}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded',
            active ? 'bg-white/20' : 'bg-surface-hover'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-muted-copy">{label}</span>
      <span className={cn('text-xs font-semibold', color || 'text-foreground')}>
        {value}
      </span>
    </div>
  );
}

export function Progress({
  value,
  max,
  color = '#22c55e',
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      ></div>
    </div>
  );
}

export function Action({
  icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: string;
}) {
  const v = {
    default:
      'border-border-soft hover:border-border-hover hover:bg-surface-hover',
    primary: 'border-primary/20 hover:bg-primary/5 text-primary',
    warning: 'border-amber-500/20 hover:bg-amber-500/5 text-amber-600',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full rounded-lg border px-3 py-2 text-xs transition-all duration-150 cursor-pointer',
        v[variant as keyof typeof v] || v.default
      )}
    >
      <span>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <svg
        className="h-3 w-3 opacity-40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}
