import React from 'react';

import { cn } from '@/shared/utils/cn';

interface SidebarHeaderProps {
  copy: { appName: string; [key: string]: string };
  collapsed?: boolean;
  onToggle?: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  copy,
  collapsed = false,
  onToggle,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between h-14 px-3 border-b border-border-soft',
        collapsed && 'px-0'
      )}
    >
      {!collapsed && (
        <div className="flex items-center gap-2">
          <img src="/brand/logo.svg" className="h-6" alt="EngVox Logo" />
          <span className="text-xs font-bold tracking-tight text-foreground">{copy.appName}</span>
        </div>
      )}
      {collapsed && onToggle && (
        <button
          onClick={onToggle}
          className="h-6 w-6 rounded mx-auto flex items-center justify-center hover:bg-surface-hover transition-colors"
          aria-label="Expand sidebar"
        >
          <img src="/brand/logo.svg" className="h-5" alt="EngVox Logo" />
        </button>
      )}
      {collapsed && !onToggle && (
        <img src="/brand/logo.svg" className="h-6 mx-auto" alt="EngVox Logo" />
      )}
    </div>
  );
};
