import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = React.memo(({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-hover mb-4">
      <Icon className="h-8 w-8 text-muted-copy" />
    </div>
    <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-copy max-w-sm mb-4">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
));
EmptyState.displayName = 'EmptyState';
