import { type HTMLAttributes, memo } from 'react';

import { cn } from '@/shared/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> { hoverEffect?: boolean; }

export const Card = memo<CardProps>(({ className, children, hoverEffect, ...props }) => (
  <div className={cn('rounded-[var(--radius-card)] border border-border-soft bg-surface shadow-card transition-all duration-200', hoverEffect && 'hover:border-border-hover hover:shadow-pop', className)} {...props}>{children}</div>
));
Card.displayName = 'Card';
