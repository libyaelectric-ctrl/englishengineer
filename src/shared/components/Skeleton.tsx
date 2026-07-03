import React from 'react';
import { cn } from '@/shared/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'card' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'line',
  className,
  ...props
}) => {
  const variantClass = {
    line: 'h-3 rounded-full',
    card: 'h-28 rounded-card',
    circle: 'h-10 w-10 rounded-full',
  }[variant];

  return (
    <div
      className={cn(
        'aurora-skeleton border border-border-soft bg-surface-hover/30',
        variantClass,
        className
      )}
      {...props}
    />
  );
};
