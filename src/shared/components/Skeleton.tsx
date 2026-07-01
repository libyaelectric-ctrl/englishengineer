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
    card: 'h-28 rounded-[16px]',
    circle: 'h-10 w-10 rounded-full',
  }[variant];

  return (
    <div
      className={cn(
        'aurora-skeleton border border-slate-200 bg-slate-100/80',
        variantClass,
        className
      )}
      {...props}
    />
  );
};
