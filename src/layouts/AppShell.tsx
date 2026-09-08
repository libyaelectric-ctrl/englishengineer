import { useAppStore } from '@/store/app.store';
import { Menu } from 'lucide-react';

import { type FC, Suspense, lazy, useEffect, useRef } from 'react';

import { Outlet } from 'react-router-dom';

import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { useGlobalShortcuts } from '@/shared/hooks/useGlobalShortcuts';
import { useKeyboardNavigation } from '@/shared/hooks/useKeyboardNavigation';
import { usePageTracking } from '@/shared/hooks/usePageTracking';

import { useMascotEvents } from '@/features/mascot';

const Sidebar = lazy(() => import('./Sidebar').then((m) => ({ default: m.Sidebar })));
const RightSidebar = lazy(() => import('./RightSidebar').then((m) => ({ default: m.RightSidebar })));
const MobileBottomNavigation = lazy(() => import('./MobileBottomNavigation').then((m) => ({ default: m.MobileBottomNavigation })));
const BetaAnalyticsTracker = lazy(() => import('@/features/beta').then((m) => ({ default: m.BetaAnalyticsTracker })));
const BetaFeedbackWidget = lazy(() => import('@/features/beta').then((m) => ({ default: m.BetaFeedbackWidget })));
const EngMascot = lazy(() => import('@/features/mascot').then((m) => ({ default: m.EngMascot })));
const CommandPalette = lazy(() => import('@/shared/components/CommandPalette'));
const KeyboardShortcutsPanel = lazy(() => import('@/shared/components/KeyboardShortcutsPanel'));

export const AppShell: FC = () => {
  const { toggleSidebar } = useAppStore();
  const mainRef = useRef<HTMLElement>(null);

  useKeyboardNavigation({ key: 'Escape', onKeyPress: () => toggleSidebar() });
  useGlobalShortcuts();
  usePageTracking();
  useMascotEvents();

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const preventMiddleScroll = (e: MouseEvent) => { if (e.button === 1) e.preventDefault(); };
    el.addEventListener('mousedown', preventMiddleScroll);
    return () => el.removeEventListener('mousedown', preventMiddleScroll);
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#040611] dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(6,182,212,0.16),transparent_28%),radial-gradient(circle_at_86%_14%,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,rgba(248,250,252,0.82),rgba(241,245,249,0.96))] dark:bg-[radial-gradient(circle_at_18%_8%,rgba(6,182,212,0.20),transparent_28%),radial-gradient(circle_at_86%_14%,rgba(168,85,247,0.20),transparent_30%),linear-gradient(180deg,rgba(4,6,17,0.84),rgba(4,6,17,0.98))]" />
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Suspense fallback={<div className="hidden" aria-hidden="true" />}><CommandPalette /><KeyboardShortcutsPanel /></Suspense>
      <Suspense fallback={<div className="hidden" aria-hidden="true" />}><Sidebar /></Suspense>
      <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={null}><BetaAnalyticsTracker /></Suspense>
        <div className="z-40 flex h-12 shrink-0 items-center justify-between border-b border-slate-900/10 bg-white/74 px-3 backdrop-blur-2xl dark:border-white/10 dark:bg-[#040611]/72 lg:hidden" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center gap-2"><button onClick={toggleSidebar} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-900/5 hover:text-slate-950 dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Toggle navigation sidebar"><Menu className="h-5 w-5" /></button><div className="flex items-center gap-1.5"><img src="/brand/logo.svg" alt="EngVox" className="h-7 w-7 rounded-lg" /><span className="text-sm font-black">EngVox</span></div></div>
          <ThemeToggle />
        </div>
        <main id="main-content" ref={mainRef} className="custom-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden overscroll-none px-4 pb-20 pt-4 sm:px-6 lg:px-8 lg:pb-8" style={{ touchAction: 'pan-y' }}>
          <div className="mx-auto w-full max-w-6xl"><Outlet /></div>
        </main>
        <Suspense fallback={null}><BetaFeedbackWidget /></Suspense>
        <Suspense fallback={null}><EngMascot /></Suspense>
        <Suspense fallback={null}><MobileBottomNavigation /></Suspense>
      </div>
      <Suspense fallback={<div className="hidden" aria-hidden="true" />}><RightSidebar /></Suspense>
    </div>
  );
};
