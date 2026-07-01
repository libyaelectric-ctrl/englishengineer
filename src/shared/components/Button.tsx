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
    'border border-primary bg-primary text-white shadow-[0_8px_20px_rgba(59,113,143,0.14)] hover:border-primary-hover hover:bg-primary-hover hover:shadow-[0_10px_24px_rgba(59,113,143,0.18)]',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-800',
  outline:
    'border border-slate-300 bg-transparent text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-800',
  ghost:
    'border border-transparent bg-transparent text-slate-600 hover:border-blue-100 hover:bg-blue-50/70 hover:text-blue-800',
  danger:
    'border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100',
  success:
    'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(({ className, variant = 'primary', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex min-h-10 min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal break-words rounded-[12px] px-4 py-2 text-center text-sm font-semibold leading-tight transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      variantClasses[variant],
      className
    )}
    {...props}
  />
));

Button.displayName = 'Button';
