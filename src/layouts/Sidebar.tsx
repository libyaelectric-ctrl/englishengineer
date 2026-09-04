import { useAppStore } from '@/store/app.store';
import { X } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { useState, useTransition } from 'react';

import { useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { CLERK_SIGN_IN_URL } from '@/features/auth/clerk.config';
import { useBillingStore } from '@/features/billing';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';

import { Navigation } from './Navigation';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SIDEBAR_COPY } from './sidebar/sidebar.data';

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
  const [lastNonEn, setLastNonEn] = useState<string>(language !== 'en' ? language : 'tr');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const copy = SIDEBAR_COPY[language] ?? SIDEBAR_COPY.en;
  const altLang = INTERFACE_LANGUAGES.find(
    (l) => l.id === (language !== 'en' ? language : lastNonEn)
  );
  const planName = subscription?.planId || 'free';

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024 && isSidebarOpen) toggleSidebar();
  };
  const handleLogout = async () => {
    await logout();
    startTransition(() => navigate(CLERK_SIGN_IN_URL));
  };

  return (
    <>
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden border-0"
          onClick={toggleSidebar}
          aria-label="Close"
        />
      )}
      <aside
        data-testid="app-sidebar"
        role="navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border-hover bg-surface transition-all lg:static lg:flex lg:translate-x-0',
          isSidebarCollapsed ? 'w-16' : 'w-64',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-screen flex-col overflow-hidden bg-surface">
          <SidebarHeader
            collapsed={isSidebarCollapsed}
            onToggle={toggleSidebarCollapsed}
            copy={copy}
          />
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-1 px-3 py-1 border-b border-border-soft">
              {altLang && (
                <button
                  type="button"
                  onClick={() => {
                    setLanguage(altLang.id);
                    setLastNonEn(altLang.id);
                  }}
                  className="h-8 border rounded px-1.5 text-[9px] font-bold uppercase"
                >
                  {altLang.id.toUpperCase()}
                </button>
              )}
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className="h-8 border rounded px-1.5 text-[9px] font-bold"
              >
                EN
              </button>
              <ThemeToggle />
              <button
                onClick={toggleSidebar}
                className="lg:hidden ml-auto border-0 bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Navigation onItemClick={closeSidebarOnMobile} collapsed={isSidebarCollapsed} />
          </div>
          <SidebarFooter
            collapsed={isSidebarCollapsed}
            currentUser={currentUser}
            planName={planName}
            copy={copy}
            notificationsOpen={notificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
            onLogout={handleLogout}
            onBilling={() => {
              closeSidebarOnMobile();
              startTransition(() => navigate('/billing'));
            }}
            navigate={navigate}
            startTransition={startTransition}
            closeSidebarOnMobile={closeSidebarOnMobile}
          />
        </div>
      </aside>
    </>
  );
};
