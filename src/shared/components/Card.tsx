import React from 'react';
import { cn } from '@/shared/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  hoverEffect,
  ...props
}) => (
  <div
    className={cn(
      'rounded-xl border border-border-soft bg-surface',
      hoverEffect && 'transition-colors hover:border-border-hover',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
