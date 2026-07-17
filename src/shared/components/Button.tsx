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
    'bg-[#0047bb] text-white hover:bg-[#0047bb]/95 border border-[#0047bb] font-bold uppercase tracking-wider',
  secondary:
    'bg-white text-foreground border border-[#d9d9e3] hover:bg-[#faf8ff] hover:border-[#0047bb]/30 font-bold uppercase tracking-wider',
  outline:
    'border border-[#d9d9e3] bg-transparent text-foreground hover:bg-[#faf8ff] font-bold uppercase tracking-wider',
  ghost:
    'border border-transparent bg-transparent text-muted-copy hover:bg-[#faf8ff] hover:text-[#0047bb] font-bold uppercase tracking-wider',
  danger:
    'border border-error/20 bg-error/5 text-error hover:bg-error/10 font-bold uppercase tracking-wider',
  success:
    'border border-success/20 bg-success/5 text-success hover:bg-success/10 font-bold uppercase tracking-wider',
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
      'btn-press inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal break-words rounded-[4px] text-center font-bold leading-tight transition-all duration-150 ease-out active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-sm text-xs',
      size === 'default' && 'min-h-10 px-4 py-2',
      size === 'sm' && 'min-h-8 px-3 py-1.5 text-[10px]',
      size === 'icon' && 'h-10 w-10 p-0',
      variantClasses[variant],
      className
    )}
    {...props}
  />
));

Button.displayName = 'Button';
