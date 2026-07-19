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
      'rounded-[4px] border border-border-soft bg-surface shadow-sm',
      hoverEffect && 'transition-colors hover:border-primary/30',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
