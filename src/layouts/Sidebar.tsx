import { PRODUCT_VERSION } from '@/config/product.config';
import { useAppStore } from '@/store/app.store';
import {
  Bell,
  BookOpenCheck,
  ChevronRight,
  ChevronsLeft,
  HardDrive,
  LogOut,
  Wallet,
  X,
} from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { useEffect, useRef, useState, useTransition } from 'react';

import { useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import { SIDEBAR_EXTRA_COPY } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

import { Navigation } from './Navigation';

const SIDEBAR_COPY = {
  en: {
    billing: 'Billing & Plan',
    workspaceStatus: 'Workspace status',
    noAlerts: 'No unread system alerts',
    ready: 'Ready',
    learningQueue: 'Learning queue is ready',
    continueQueue: 'Continue from your current independent skill levels.',
    localProtection: 'Local progress protection',
    checkSync: 'Check cloud-sync and account status before changing devices.',
    signOut: 'Sign Out',
    close: 'Close navigation',
    notifications: 'View system notifications',
  },
  tr: {
    billing: 'Faturalandırma ve Plan',
    workspaceStatus: 'Çalışma alanı durumu',
    noAlerts: 'Okunmamış sistem bildirimi yok',
    ready: 'Hazır',
    learningQueue: 'Öğrenme kuyruğu hazır',
    continueQueue: 'Mevcut bağımsız beceri seviyelerinden devam edin.',
    localProtection: 'Yerel ilerleme koruması',
    checkSync: 'Cihaz değiştirmeden önce bulut eşitleme ve hesap durumunu kontrol edin.',
    signOut: 'Çıkış Yap',
    close: 'Gezinmeyi kapat',
    notifications: 'Sistem bildirimlerini görüntüle',
  },
  de: {
    billing: 'Abrechnung und Plan',
    workspaceStatus: 'Arbeitsbereichstatus',
    noAlerts: 'Keine ungelesenen Systemmeldungen',
    ready: 'Bereit',
    learningQueue: 'Lernwarteschlange ist bereit',
    continueQueue: 'Mit deinen unabhängigen Kompetenzstufen fortfahren.',
    localProtection: 'Schutz des lokalen Fortschritts',
    checkSync: 'Cloud-Synchronisierung und Kontostatus vor einem Gerätewechsel prüfen.',
    signOut: 'Abmelden',
    close: 'Navigation schließen',
    notifications: 'Systembenachrichtigungen anzeigen',
  },
} as const;

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar, isSidebarCollapsed, toggleSidebarCollapsed } = useAppStore(
    useShallow((s) => ({
      isSidebarOpen: s.isSidebarOpen,
      toggleSidebar: s.toggleSidebar,
      isSidebarCollapsed: s.isSidebarCollapsed,
      toggleSidebarCollapsed: s.toggleSidebarCollapsed,
    }))
  );
  const { currentUser, logout } = useAuthStore(
    useShallow((s) => ({ currentUser: s.currentUser, logout: s.logout }))
  );
  const { subscription } = useBillingStore(useShallow((s) => ({ subscription: s.subscription })));
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const { language, setLanguage } = useLocalizationStore();
  const [lastNonEnglish, setLastNonEnglish] = useState<SupportedInterfaceLanguage>(() =>
    language !== 'en' ? language : 'tr'
  );
  const altLang = INTERFACE_LANGUAGES.find(
    (l) => l.id === (language !== 'en' ? language : lastNonEnglish)
  );
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024 && isSidebarOpen) {
      toggleSidebar();
    }
  };
  const planName = subscription?.planId || 'free';
  const copy =
    SIDEBAR_COPY[language as keyof typeof SIDEBAR_COPY] ??
    (SIDEBAR_EXTRA_COPY[language] as typeof SIDEBAR_COPY.en) ??
    SIDEBAR_COPY.en;
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
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border-hover bg-surface transition-all duration-200 lg:static lg:flex lg:translate-x-0',
          isSidebarCollapsed ? 'w-16' : 'w-64',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-screen flex-col overflow-hidden bg-surface">
          {/* Logo + Collapse Toggle */}
          <div
            className={cn(
              'flex h-14 shrink-0 items-center border-b border-border-soft transition-all',
              isSidebarCollapsed ? 'justify-center px-2' : 'justify-between gap-2 px-3'
            )}
          >
            <div className={cn('flex items-center gap-2', isSidebarCollapsed && 'hidden')}>
              <img src="/brand/logo.svg" alt="EngVox" className="h-7 w-7 rounded-[4px]" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-foreground">EngVox</span>
                <span className="text-[9px] font-bold text-primary font-mono">
                  v{PRODUCT_VERSION}
                </span>
              </div>
            </div>
            {isSidebarCollapsed && (
              <img
                src="/brand/logo.svg"
                alt="EngVox"
                className="h-7 w-7 rounded-[4px]"
                title="EngVox"
              />
            )}
            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="hidden lg:flex cursor-pointer rounded-[4px] p-1.5 text-muted-copy hover:bg-surface-hover hover:text-foreground transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronsLeft className="h-4 w-4 rotate-180" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </button>
            {/* Language Switcher (expanded only) */}
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-1">
                {altLang && (
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage(altLang.id);
                      setLastNonEnglish(altLang.id);
                    }}
                    className={`inline-flex h-8 items-center justify-center gap-0.5 rounded-[4px] border px-1.5 text-[9px] font-bold uppercase tracking-wide cursor-pointer select-none transition-colors ${
                      language === altLang.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-soft bg-surface text-muted-copy hover:text-foreground hover:border-primary/40'
                    }`}
                    aria-label={`Language: ${altLang.nativeLabel}`}
                  >
                    <span className="text-xs leading-none">{altLang.flag}</span>
                    <span>{altLang.id.toUpperCase()}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`inline-flex h-8 items-center justify-center rounded-[4px] border px-1.5 text-[9px] font-bold uppercase tracking-wide cursor-pointer select-none transition-colors ${
                    language === 'en'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-soft bg-surface text-muted-copy hover:text-foreground hover:border-primary/40'
                  }`}
                  aria-label="Change language to English"
                >
                  EN
                </button>
                <ThemeToggle />
                <button
                  onClick={toggleSidebar}
                  className="cursor-pointer rounded-[4px] p-1.5 text-muted-copy hover:bg-surface-hover hover:text-foreground lg:hidden"
                  aria-label={copy.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div
            className={cn(
              'flex-1 overflow-y-auto custom-scrollbar',
              isSidebarCollapsed ? 'px-1 py-4' : 'px-3 py-4'
            )}
          >
            <Navigation onItemClick={closeSidebarOnMobile} collapsed={isSidebarCollapsed} />
          </div>

          {/* User Info + Billing */}
          {currentUser && (
            <div
              className={cn(
                'shrink-0 border-t border-border-soft space-y-2.5',
                isSidebarCollapsed ? 'p-2' : 'p-4'
              )}
            >
              {/* Billing Hub Trigger */}
              <button
                type="button"
                onClick={() => {
                  closeSidebarOnMobile();
                  startTransition(() => navigate('/billing'));
                }}
                className={cn(
                  'flex h-10 w-full cursor-pointer items-center gap-3 rounded-[4px] border border-border-soft bg-surface text-left transition-all hover:border-primary hover:bg-primary/5 shadow-sm text-xs font-bold uppercase tracking-wider text-muted-copy hover:text-foreground',
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                )}
                title={isSidebarCollapsed ? copy.billing : undefined}
              >
                <Wallet className="h-5 w-5 shrink-0 text-muted-copy" />
                {!isSidebarCollapsed && <span className="flex-1 truncate">{copy.billing}</span>}
              </button>

              {/* Alarm Bell */}
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  className={cn(
                    'flex h-10 w-full cursor-pointer items-center gap-3 rounded-[4px] border border-border-soft bg-surface text-left transition-all hover:border-border-hover hover:bg-surface-hover shadow-sm',
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  )}
                  aria-label={copy.notifications}
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <Bell className="h-5 w-5 shrink-0 text-muted-copy" />
                  {!isSidebarCollapsed && (
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-foreground truncate">
                        {currentUser.displayName}
                      </span>
                      <span className="block text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                        {planName} plan
                      </span>
                    </span>
                  )}
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
                          {copy.workspaceStatus}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-copy font-medium">
                          {copy.noAlerts}
                        </p>
                      </div>
                      <span className="rounded-[4px] bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase tracking-wider">
                        {copy.ready}
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
                          {copy.learningQueue}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-copy font-medium">
                          {copy.continueQueue}
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
                          {copy.localProtection}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-copy font-medium">
                          {copy.checkSync}
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-copy transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className={cn(
                  'flex h-10 w-full cursor-pointer items-center gap-3 rounded-[4px] border border-border-soft bg-surface text-left transition-all hover:border-border-hover hover:bg-surface-hover shadow-sm text-xs font-bold uppercase tracking-wider text-muted-copy hover:text-foreground',
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                )}
                title={isSidebarCollapsed ? copy.signOut : undefined}
              >
                <LogOut className="h-5 w-5 shrink-0 text-muted-copy" />
                {!isSidebarCollapsed && <span className="flex-1">{copy.signOut}</span>}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
