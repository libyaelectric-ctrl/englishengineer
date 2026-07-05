import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/app.store';
import {
  Bell,
  BookOpenCheck,
  ChevronRight,
  HardDrive,
  LogOut,
  Menu,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

export const Topbar: React.FC = () => {
  const { toggleSidebar } = useAppStore();
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const closePanel = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      if (
        event instanceof MouseEvent &&
        notificationsRef.current?.contains(event.target as Node)
      ) {
        return;
      }
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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border-soft bg-background/90 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={toggleSidebar}
        className="cursor-pointer rounded-lg p-1.5 text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground"
        aria-label="Toggle navigation sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {currentUser && (
          <div className="hidden sm:flex flex-col items-end text-right mr-2">
            <span className="text-sm font-medium text-foreground">
              {currentUser.displayName}
            </span>
            <span className="text-[10px] text-muted-copy">
              {currentUser.role}
            </span>
          </div>
        )}

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            className="relative cursor-pointer rounded-lg p-2 text-muted-copy transition-all hover:bg-surface-hover hover:text-foreground"
            aria-label="View system notifications"
            aria-expanded={notificationsOpen}
            aria-controls="system-notifications-panel"
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-success" />
          </button>

          {notificationsOpen && (
            <div
              id="system-notifications-panel"
              role="status"
              className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border-soft bg-surface shadow-lg"
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
                    Check cloud-sync and account status before changing devices.
                  </span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-copy transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        <Link
          to="/profile"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-foreground text-background text-xs font-bold uppercase transition-all hover:opacity-80"
          aria-label="View professional profile"
        >
          {currentUser?.avatarInitials || <User className="h-4 w-4" />}
        </Link>

        <button
          onClick={handleLogout}
          className="cursor-pointer rounded-lg p-2 text-muted-copy transition-all hover:bg-surface-hover hover:text-foreground"
          aria-label="Logout"
          title="Sign out of EngineerOS"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
