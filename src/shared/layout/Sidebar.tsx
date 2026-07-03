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
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        data-testid="app-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border-soft bg-surface transition-transform lg:static lg:flex lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-screen flex-col overflow-hidden bg-surface">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-soft px-5">
            <div className="flex items-center gap-3">
              <div className="rounded-[8px] border border-primary/20 bg-primary/10 p-2 text-primary shadow-sm">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-sm font-bold text-foreground">
                  EngineerOS
                </span>
                <span className="block text-[9px] font-mono uppercase tracking-wider text-muted-copy">
                  Command Center
                </span>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="cursor-pointer rounded-[8px] p-1.5 text-muted-copy hover:bg-surface-hover hover:text-foreground lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Navigation
              onItemClick={() => {
                if (window.innerWidth < 1024 && isSidebarOpen) toggleSidebar();
              }}
            />
          </div>

          {currentUser && (
            <div className="shrink-0 space-y-4 border-t border-border-soft bg-surface-hover/10 p-4 font-sans">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-primary/20 bg-primary/10 font-mono text-xs font-bold uppercase text-primary">
                  {currentUser.avatarInitials}
                </div>
                <div className="min-w-0">
                  <h5 className="break-words text-xs font-bold leading-5 text-foreground">
                    {currentUser.displayName}
                  </h5>
                  <p
                    className="mt-0.5 break-words text-[10px] leading-4 text-muted-copy truncate"
                    title={currentUser.role}
                  >
                    {currentUser.role}
                  </p>
                </div>
              </div>

              <div className="space-y-1 rounded-[8px] border border-border-soft bg-surface p-2.5 font-mono text-[9px] text-muted-copy">
                <div className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-muted-copy/70">DISCIPLINE:</span>
                  <span
                    className="max-w-[120px] break-words text-right font-semibold leading-4 text-foreground"
                    title={currentUser.engineeringDiscipline}
                  >
                    {currentUser.engineeringDiscipline}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-copy/70">TARGET:</span>
                  <span className="max-w-[120px] truncate font-semibold text-foreground">
                    {currentUser.targetLevel}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20"
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
