import { type FC, type HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container: FC<ContainerProps> = ({
  children,
  className,
  size = 'xl',
  ...props
}) => {
  const maxClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        maxClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
