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
        'premium-panel rounded-[16px] p-5 sm:p-6 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out',
        hoverEffect &&
          'hover:-translate-y-px hover:border-sky-200 hover:bg-sky-50/35 hover:shadow-[0_16px_42px_rgba(59,113,143,0.08)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
