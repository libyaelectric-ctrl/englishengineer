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
    'bg-foreground text-background hover:opacity-90 border border-foreground',
  secondary:
    'bg-surface text-foreground border border-border-soft hover:bg-surface-hover hover:border-border-hover',
  outline:
    'border border-border-soft bg-transparent text-foreground hover:bg-surface-hover',
  ghost:
    'border border-transparent bg-transparent text-muted-copy hover:bg-surface-hover hover:text-foreground',
  danger: 'border border-error/20 bg-error/5 text-error hover:bg-error/10',
  success:
    'border border-success/20 bg-success/5 text-success hover:bg-success/10',
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(({ className, variant = 'primary', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex min-h-10 min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal break-words rounded-lg px-4 py-2 text-center text-sm font-medium leading-tight transition-all duration-150 ease-out active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer',
      variantClasses[variant],
      className
    )}
    {...props}
  />
));

Button.displayName = 'Button';
