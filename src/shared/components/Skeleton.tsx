import { type FC, type HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'card' | 'circle' | 'avatar' | 'button' | 'image';
}

export const Skeleton: FC<SkeletonProps> = ({
  variant = 'line',
  className,
  ...props
}) => {
  const variantClass = {
    line: 'h-3 rounded-full',
    card: 'h-28 rounded-xl',
    circle: 'h-10 w-10 rounded-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-32 rounded-lg',
    image: 'h-48 w-full rounded-xl',
  }[variant];

  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-hover',
        variantClass,
        className
      )}
      {...props}
    />
  );
};
