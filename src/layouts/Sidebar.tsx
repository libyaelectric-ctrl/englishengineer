import { useAppStore } from '@/store/app.store';
import { X } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { useState, useTransition } from 'react';

import { useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { AUTH_SIGN_IN_URL } from '@/features/auth/firebase.config';
import { useBillingStore } from '@/features/billing';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';

import { Navigation } from './Navigation';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SIDEBAR_COPY } from './sidebar/sidebar.data';

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar, isSidebarCollapsed, toggleSidebarCollapsed } = useAppStore(useShallow((s) => ({ isSidebarOpen: s.isSidebarOpen, toggleSidebar: s.toggleSidebar, isSidebarCollapsed: s.isSidebarCollapsed, toggleSidebarCollapsed: s.toggleSidebarCollapsed })));
  const { currentUser, logout } = useAuthStore(useShallow((s) => ({ currentUser: s.currentUser, logout: s.logout })));
  const { subscription } = useBillingStore(useShallow((s) => ({ subscription: s.subscription })));
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const { language, setLanguage } = useLocalizationStore();
  const [lastNonEn, setLastNonEn] = useState<string>(language !== 'en' ? language : 'tr');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const copy = SIDEBAR_COPY[language] ?? SIDEBAR_COPY.en;
  const altLang = INTERFACE_LANGUAGES.find((l) => l.id === (language !== 'en' ? language : lastNonEn));
  const planName = subscription?.planId || 'free';
  const closeSidebarOnMobile = () => { if (window.innerWidth < 1024 && isSidebarOpen) toggleSidebar(); };
  const handleLogout = async () => { await logout(); startTransition(() => navigate(AUTH_SIGN_IN_URL)); };

  return (
    <>
      {isSidebarOpen && <button type="button" className="fixed inset-0 z-30 border-0 bg-black/60 backdrop-blur-sm lg:hidden" onClick={toggleSidebar} aria-label="Close" />}
      <nav data-testid="app-sidebar" aria-label="Sidebar navigation" aria-hidden={!isSidebarOpen} className={cn('fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-900/10 bg-white/70 backdrop-blur-2xl transition-all dark:border-white/10 dark:bg-[#060a16]/78 lg:static lg:flex lg:translate-x-0', isSidebarCollapsed ? 'w-16' : 'w-64', isSidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-screen flex-col overflow-hidden bg-transparent">
          <SidebarHeader collapsed={isSidebarCollapsed} onToggle={toggleSidebarCollapsed} copy={copy} />
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-1 border-b border-slate-900/10 px-3 py-2 dark:border-white/10">
              {altLang && <button type="button" onClick={() => { setLanguage(altLang.id); setLastNonEn(altLang.id); }} className="h-8 rounded-xl border border-slate-900/10 bg-white/60 px-2 text-[9px] font-black uppercase dark:border-white/10 dark:bg-white/[0.06]">{altLang.id.toUpperCase()}</button>}
              <button type="button" onClick={() => setLanguage('en')} className="h-8 rounded-xl border border-slate-900/10 bg-white/60 px-2 text-[9px] font-black dark:border-white/10 dark:bg-white/[0.06]">EN</button>
              <ThemeToggle />
              <button onClick={toggleSidebar} aria-label="Close sidebar" className="ml-auto cursor-pointer border-0 bg-transparent lg:hidden"><X size={16} /></button>
            </div>
          )}
          <div className="custom-scrollbar flex-1 overflow-y-auto"><Navigation onItemClick={closeSidebarOnMobile} collapsed={isSidebarCollapsed} /></div>
          <SidebarFooter collapsed={isSidebarCollapsed} currentUser={currentUser} planName={planName} copy={copy} notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen} onLogout={handleLogout} onBilling={() => { closeSidebarOnMobile(); startTransition(() => navigate('/billing')); }} navigate={navigate} startTransition={startTransition} closeSidebarOnMobile={closeSidebarOnMobile} />
        </div>
      </nav>
    </>
  );
};
