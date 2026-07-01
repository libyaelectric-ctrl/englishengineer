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
    <header className="sticky top-0 z-30 flex h-18 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/78 px-5 backdrop-blur-xl sm:px-8">
      <button
        onClick={toggleSidebar}
        className="cursor-pointer rounded-[12px] p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
        aria-label="Toggle navigation sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {currentUser && (
          <div className="hidden sm:flex flex-col items-end text-right mr-2 font-sans">
            <span className="text-xs font-black text-slate-950">
              {currentUser.displayName}
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              {currentUser.role}
            </span>
          </div>
        )}

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            className="relative cursor-pointer rounded-[12px] p-2 text-slate-500 transition-all hover:bg-sky-50 hover:text-sky-800"
            aria-label="View system notifications"
            aria-expanded={notificationsOpen}
            aria-controls="system-notifications-panel"
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
          </button>

          {notificationsOpen && (
            <div
              id="system-notifications-panel"
              role="status"
              className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.16)]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    Workspace status
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    No unread system alerts
                  </p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                  Ready
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate('/curriculum');
                }}
                className="group flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-sky-50/70"
              >
                <span className="rounded-[10px] border border-sky-200 bg-sky-50 p-2 text-sky-700">
                  <BookOpenCheck className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900">
                    Learning queue is ready
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Continue from your current independent skill levels.
                  </span>
                </span>
                <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate('/profile');
                }}
                className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-sky-50/70"
              >
                <span className="rounded-[10px] border border-amber-200 bg-amber-50 p-2 text-amber-700">
                  <HardDrive className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900">
                    Local progress protection
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Check cloud-sync and account status before changing devices.
                  </span>
                </span>
                <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        <Link
          to="/profile"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-blue-200 bg-blue-50 font-mono text-xs font-bold uppercase text-blue-800 shadow-sm transition-all hover:-translate-y-px hover:border-blue-300 hover:bg-blue-100"
          aria-label="View professional profile"
        >
          {currentUser?.avatarInitials || <User className="h-5 w-5" />}
        </Link>

        <button
          onClick={handleLogout}
          className="cursor-pointer rounded-[12px] p-2 text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600"
          aria-label="Logout"
          title="Sign out of EngineerOS"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
