import React from 'react';
import { LucideIcon, Radio } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from './Button';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Radio,
  actionText,
  onAction,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'premium-surface flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border-dashed p-12 text-center',
        className
      )}
      {...props}
    >
      <div className="mb-4 rounded-[12px] border border-blue-100 bg-blue-50 p-4 text-blue-700">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          className="mt-6 h-9 px-4 text-xs"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
