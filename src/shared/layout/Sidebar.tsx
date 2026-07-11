import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  X,
  Bell,
  ChevronRight,
  BookOpenCheck,
  HardDrive,
} from 'lucide-react';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import { cn } from '@/shared/utils/cn';
import { Navigation } from './Navigation';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const { currentUser, logout } = useAuthStore();
  const { subscription } = useBillingStore();
  const navigate = useNavigate();
  const planName = subscription?.planId || 'free';
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closePanel = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      if (
        event instanceof MouseEvent &&
        notificationsRef.current?.contains(event.target as Node)
      )
        return;
      setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', closePanel);
    document.addEventListener('keydown', closePanel);
    return () => {
      document.removeEventListener('mousedown', closePanel);
      document.removeEventListener('keydown', closePanel);
    };
  }, [notificationsOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/10 backdrop-blur-[1px] lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        data-testid="app-sidebar"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border-hover bg-surface transition-transform lg:static lg:flex lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-screen flex-col overflow-hidden bg-surface">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-soft px-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/brand/logo.png"
                alt="EngVox"
                className="h-9 w-9 rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-foreground">
                  EngVox
                </span>
                <span className="text-[10px] font-medium text-muted-copy leading-tight">
                  V.4.0.1
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={toggleSidebar}
                className="cursor-pointer rounded-lg p-1.5 text-muted-copy hover:bg-surface-hover hover:text-foreground lg:hidden"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mascot + Navigation */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
            {/* Mascot */}
            <div className="mb-4 flex justify-center">
              <img
                src="/brand/mascot.png"
                alt="EngVox Mascot"
                className="h-28 w-auto"
              />
            </div>
            <Navigation
              onItemClick={() => {
                if (window.innerWidth < 1024 && isSidebarOpen) toggleSidebar();
              }}
            />
          </div>

          {/* User Info + Alarm */}
          {currentUser && (
            <div className="shrink-0 border-t border-border-soft p-4">
              {/* Alarm Bell */}
              <div className="relative mb-3" ref={notificationsRef}>
                <button
                  type="button"
                  className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg border border-border-soft bg-surface px-3 text-left transition-all hover:border-border-hover hover:bg-surface-hover"
                  aria-label="View system notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <Bell className="h-5 w-5 shrink-0 text-muted-copy" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground truncate">
                      {currentUser.displayName}
                    </span>
                    <span className="block text-[10px] text-muted-copy capitalize">
                      {planName} plan
                    </span>
                  </span>
                  <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-success" />
                </button>

                {notificationsOpen && (
                  <div
                    role="status"
                    className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-border-soft bg-surface shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Workspace status
                        </p>
                        <p className="mt-0.5 text-xs text-muted-copy">
                          No unread system alerts
                        </p>
                      </div>
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                        Ready
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/curriculum');
                      }}
                      className="group flex w-full items-start gap-3 border-b border-border-soft px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                    >
                      <span className="rounded-lg bg-foreground/5 p-2 text-foreground">
                        <BookOpenCheck className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                          Learning queue is ready
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-copy">
                          Continue from your current independent skill levels.
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-copy transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/profile');
                      }}
                      className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                    >
                      <span className="rounded-lg bg-warning/10 p-2 text-warning">
                        <HardDrive className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                          Local progress protection
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-copy">
                          Check cloud-sync and account status before changing
                          devices.
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-copy transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="mt-2 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border-soft bg-surface text-xs font-medium text-muted-copy transition-all hover:border-border-hover hover:text-foreground"
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
