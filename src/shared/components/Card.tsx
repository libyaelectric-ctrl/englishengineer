import React from 'react';
import { cn } from '@/shared/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'premium-panel rounded-card p-5 sm:p-6 transition-all duration-150 ease-out',
        hoverEffect &&
          'hover:-translate-y-px hover:border-border-hover hover:bg-surface-hover/10 shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
