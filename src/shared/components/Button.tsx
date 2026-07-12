import { forwardRef, type ButtonHTMLAttributes } from 'react';
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

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: 'default' | 'sm' | 'icon';
  }
>(({ className, variant = 'primary', size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'btn-press inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal break-words rounded-lg text-center font-medium leading-tight transition-all duration-150 ease-out active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer',
      size === 'default' && 'min-h-10 px-4 py-2 text-sm',
      size === 'sm' && 'min-h-8 px-3 py-1.5 text-xs',
      size === 'icon' && 'h-10 w-10 p-0',
      variantClasses[variant],
      className
    )}
    {...props}
  />
));

Button.displayName = 'Button';
