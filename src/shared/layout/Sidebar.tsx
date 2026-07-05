import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, LogOut, X } from 'lucide-react';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/features/auth';
import { cn } from '@/shared/utils/cn';
import { Navigation } from './Navigation';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10 dark:bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        data-testid="app-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border-soft bg-[#f7f7f8] dark:bg-[#0a0a0a] transition-transform lg:static lg:flex lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-screen flex-col overflow-hidden bg-[#f7f7f8] dark:bg-[#0a0a0a]">
          {/* Logo */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border-soft px-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <Cpu className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                EngineerOS
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="cursor-pointer rounded-lg p-1.5 text-muted-copy hover:bg-surface-hover hover:text-foreground lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
            <Navigation
              onItemClick={() => {
                if (window.innerWidth < 1024 && isSidebarOpen) toggleSidebar();
              }}
            />
          </div>

          {/* User Info */}
          {currentUser && (
            <div className="shrink-0 border-t border-border-soft p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold uppercase">
                  {currentUser.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="truncate text-sm font-medium text-foreground">
                    {currentUser.displayName}
                  </h5>
                  <p className="mt-0.5 truncate text-xs text-muted-copy">
                    {currentUser.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border-soft bg-surface text-xs font-medium text-muted-copy transition-all hover:border-border-hover hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
