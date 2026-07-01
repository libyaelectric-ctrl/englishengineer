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
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        data-testid="app-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:flex lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-screen flex-col overflow-hidden bg-white">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5">
            <div className="flex items-center gap-3">
              <div className="rounded-[10px] border border-sky-200 bg-sky-600 p-2 text-white shadow-sm">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-lg font-black text-slate-950">
                  EngineerOS
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Communication OS
                </span>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="cursor-pointer rounded-[12px] p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-950 lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
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
            <div className="shrink-0 space-y-4 border-t border-slate-200 bg-slate-50/80 p-5 font-sans">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-blue-200 bg-blue-50 font-mono text-xs font-bold uppercase text-blue-800">
                  {currentUser.avatarInitials}
                </div>
                <div className="min-w-0">
                  <h5 className="break-words text-sm font-black leading-5 text-slate-950">
                    {currentUser.displayName}
                  </h5>
                  <p
                    className="mt-0.5 break-words text-[11px] leading-4 text-slate-500"
                    title={currentUser.role}
                  >
                    {currentUser.role}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 rounded-[12px] border border-slate-200 bg-white p-3 font-mono text-[10px] text-slate-500">
                <div className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-slate-400">DISCIPLINE:</span>
                  <span
                    className="max-w-[130px] break-words text-right font-bold leading-4 text-slate-700"
                    title={currentUser.engineeringDiscipline}
                  >
                    {currentUser.engineeringDiscipline}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TARGET:</span>
                  <span className="max-w-[120px] truncate font-bold text-slate-950">
                    {currentUser.targetLevel}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100"
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
