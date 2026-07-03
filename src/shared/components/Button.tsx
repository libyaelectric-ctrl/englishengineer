import React from 'react';
import { cn } from '@/shared/utils/cn';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-primary bg-primary text-white hover:bg-primary-hover hover:border-primary-hover active:bg-primary-hover/90 shadow-sm',
  secondary:
    'border border-border-soft bg-surface text-foreground hover:bg-surface-hover hover:border-border-hover active:bg-surface-hover shadow-sm',
  outline:
    'border border-border-soft bg-transparent text-foreground hover:bg-surface-hover hover:border-border-hover',
  ghost:
    'border border-transparent bg-transparent text-muted-copy hover:bg-surface-hover hover:text-foreground',
  danger:
    'border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/30',
  success:
    'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30',
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(({ className, variant = 'primary', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex min-h-10 min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal break-words rounded-[8px] px-4 py-2 text-center text-sm font-semibold leading-tight transition-all duration-150 ease-out active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      variantClasses[variant],
      className
    )}
    {...props}
  />
));

Button.displayName = 'Button';
