import { PRODUCT_VERSION } from '@/config/product.config';
import { useAppStore } from '@/store/app.store';
import { Bell, BookOpenCheck, ChevronRight, HardDrive, LogOut, Wallet, X } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { useEffect, useRef, useState, useTransition } from 'react';

import { useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

import { Navigation } from './Navigation';

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useAppStore(
    useShallow((s) => ({ isSidebarOpen: s.isSidebarOpen, toggleSidebar: s.toggleSidebar }))
  );
  const { currentUser, logout } = useAuthStore(
    useShallow((s) => ({ currentUser: s.currentUser, logout: s.logout }))
  );
  const { subscription } = useBillingStore(useShallow((s) => ({ subscription: s.subscription })));
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const { language, setLanguage } = useLocalizationStore();
  const currentLangOption =
    INTERFACE_LANGUAGES.find((l) => l.id === language) || INTERFACE_LANGUAGES[0];
  const dashboardLanguages = INTERFACE_LANGUAGES.filter(
    (l) => l.id === language || l.id === ('en' as SupportedInterfaceLanguage)
  );
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024 && isSidebarOpen) {
      toggleSidebar();
    }
  };
  const planName = subscription?.planId || 'junior';
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closePanel = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      if (event instanceof MouseEvent && notificationsRef.current?.contains(event.target as Node))
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
    startTransition(() => navigate('/login'));
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-30 bg-foreground/10 backdrop-blur-[1px] lg:hidden"
          onClick={toggleSidebar}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleSidebar();
            }
          }}
          aria-label="Close sidebar"
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
              <img src="/brand/logo.webp" alt="EngVox" className="h-9 w-9 rounded-[4px]" />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-foreground">EngVox</span>
                <span className="text-[10px] font-bold text-primary leading-tight font-mono">
                  v{PRODUCT_VERSION}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <div className="relative group">
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border-soft bg-surface text-muted-copy hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                  aria-label="Change language"
                >
                  <span className="text-sm leading-none">{currentLangOption.flag}</span>
                </button>
                <div className="absolute left-0 top-full mt-1 hidden group-hover:flex flex-col rounded-[var(--radius-card)] border border-border-soft bg-surface p-1.5 shadow-xl min-w-[160px] max-h-[320px] overflow-y-auto z-50 animate-in fade-in duration-150">
                  {dashboardLanguages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setLanguage(lang.id as SupportedInterfaceLanguage)}
                      className={`flex items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                        language === lang.id
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground hover:bg-surface-hover'
                      }`}
                    >
                      <span className="text-sm leading-none">{lang.flag}</span>
                      <span className="truncate">{lang.nativeLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
              <ThemeToggle />
              <button
                onClick={toggleSidebar}
                className="cursor-pointer rounded-[4px] p-1.5 text-muted-copy hover:bg-surface-hover hover:text-foreground lg:hidden"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
            <Navigation onItemClick={closeSidebarOnMobile} />
          </div>

          {/* User Info + Billing */}
          {currentUser && (
            <div className="shrink-0 border-t border-border-soft p-4 space-y-2.5">
              {/* Billing Hub Trigger */}
              <button
                type="button"
                onClick={() => {
                  closeSidebarOnMobile();
                  startTransition(() => navigate('/billing'));
                }}
                className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-[4px] border border-border-soft bg-surface px-3 text-left transition-all hover:border-primary hover:bg-primary/5 shadow-sm text-xs font-bold uppercase tracking-wider text-muted-copy hover:text-foreground"
              >
                <Wallet className="h-5 w-5 shrink-0 text-muted-copy" />
                <span className="flex-1 truncate">Billing & Plan</span>
              </button>

              {/* Alarm Bell */}
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-[4px] border border-border-soft bg-surface px-3 text-left transition-all hover:border-border-hover hover:bg-surface-hover shadow-sm"
                  aria-label="View system notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <Bell className="h-5 w-5 shrink-0 text-muted-copy" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-foreground truncate">
                      {currentUser.displayName}
                    </span>
                    <span className="block text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                      {planName} plan
                    </span>
                  </span>
                  <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-success" />
                </button>

                {notificationsOpen && (
                  <div
                    role="status"
                    className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-[4px] border border-border-soft bg-surface shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
                      <div>
                        <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Workspace status
                        </p>
                        <p className="mt-0.5 text-xs text-muted-copy font-medium">
                          No unread system alerts
                        </p>
                      </div>
                      <span className="rounded-[4px] bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase tracking-wider">
                        Ready
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        closeSidebarOnMobile();
                        startTransition(() => navigate('/curriculum'));
                      }}
                      className="group flex w-full items-start gap-3 border-b border-border-soft px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                    >
                      <span className="rounded-[4px] bg-foreground/5 p-2 text-foreground">
                        <BookOpenCheck className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-foreground uppercase tracking-wider">
                          Learning queue is ready
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-copy font-medium">
                          Continue from your current independent skill levels.
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-copy transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        closeSidebarOnMobile();
                        startTransition(() => navigate('/profile'));
                      }}
                      className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                    >
                      <span className="rounded-[4px] bg-warning/10 p-2 text-warning">
                        <HardDrive className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-foreground uppercase tracking-wider">
                          Local progress protection
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-copy font-medium">
                          Check cloud-sync and account status before changing devices.
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-copy transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-[4px] border border-border-soft bg-surface px-3 text-left transition-all hover:border-border-hover hover:bg-surface-hover shadow-sm text-xs font-bold uppercase tracking-wider text-muted-copy hover:text-foreground"
              >
                <LogOut className="h-5 w-5 shrink-0 text-muted-copy" />
                <span className="flex-1">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
