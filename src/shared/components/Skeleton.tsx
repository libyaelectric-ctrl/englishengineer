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

export const SkeletonCard = () => (
  <div className="rounded-xl border border-border-soft p-5 space-y-3">
    <Skeleton variant="avatar" />
    <Skeleton variant="line" className="w-3/4" />
    <Skeleton variant="line" className="w-full" />
    <Skeleton variant="line" className="w-2/3" />
  </div>
);

export const SkeletonPage = () => (
  <div className="space-y-6 p-6">
    <Skeleton variant="line" className="w-48 h-8" />
    <Skeleton variant="line" className="w-96" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);
