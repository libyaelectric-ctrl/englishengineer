import { type FC, type HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: FC<CardProps> = ({
  className,
  children,
  hoverEffect,
  ...props
}) => (
  <div
    className={cn(
      'rounded-xl border border-border-soft bg-surface/80 shadow-sm transition-all duration-300',
      hoverEffect && 'hover:border-border-hover hover:shadow-md',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
