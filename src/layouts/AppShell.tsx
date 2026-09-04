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
const RightSidebar = lazy(() =>
  import('./RightSidebar').then((m) => ({ default: m.RightSidebar }))
);
const MobileBottomNavigation = lazy(() =>
  import('./MobileBottomNavigation').then((m) => ({ default: m.MobileBottomNavigation }))
);

const BetaAnalyticsTracker = lazy(() =>
  import('@/features/beta').then((m) => ({ default: m.BetaAnalyticsTracker }))
);
const BetaFeedbackWidget = lazy(() =>
  import('@/features/beta').then((m) => ({ default: m.BetaFeedbackWidget }))
);
const EngMascot = lazy(() => import('@/features/mascot').then((m) => ({ default: m.EngMascot })));
const CommandPalette = lazy(() => import('@/shared/components/CommandPalette'));
const KeyboardShortcutsPanel = lazy(() => import('@/shared/components/KeyboardShortcutsPanel'));

export const AppShell: FC = () => {
  const { toggleSidebar } = useAppStore();
  const mainRef = useRef<HTMLElement>(null);

  useKeyboardNavigation({
    key: 'Escape',
    onKeyPress: () => toggleSidebar(),
  });

  // Global keyboard shortcuts (Ctrl+K, number navigation, etc.)
  useGlobalShortcuts();

  // Automatic page visit + time tracking
  usePageTracking();

  // Mascot event integration (XP, streak, level-up, farewell)
  useMascotEvents();

  // Block middle-click auto-scroll pan (mouse button 1 = wheel click)
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const preventMiddleScroll = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };
    el.addEventListener('mousedown', preventMiddleScroll);
    return () => el.removeEventListener('mousedown', preventMiddleScroll);
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-primary focus:text-[var(--color-primary-foreground)] focus:rounded-[var(--radius-card)]"
      >
        Skip to main content
      </a>
      <Suspense fallback={<div className="hidden" aria-hidden="true" />}>
        <CommandPalette />
        <KeyboardShortcutsPanel />
      </Suspense>
      {/* Nav1 - Left sidebar */}
      <Suspense fallback={<div className="hidden" aria-hidden="true" />}>
        <Sidebar />
      </Suspense>

      {/* Main content */}
      <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={null}>
          <BetaAnalyticsTracker />
        </Suspense>
        {/* Mobile top app bar */}
        <div
          className="flex h-12 items-center justify-between border-b border-border-soft bg-surface/95 px-3 backdrop-blur-md lg:hidden shrink-0 z-40"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-copy hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <img src="/brand/logo.svg" alt="EngVox" className="h-5 w-5" />
              <span className="text-sm font-bold text-foreground">EngVox</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
          </div>
        </div>
        <main
          id="main-content"
          ref={mainRef}
          className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden overscroll-none px-4 pb-20 pt-4 sm:px-6 lg:px-8 lg:pb-8 max-w-full"
          style={{ touchAction: 'pan-y' }}
        >
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
        <Suspense fallback={null}>
          <BetaFeedbackWidget />
        </Suspense>
        <Suspense fallback={null}>
          <EngMascot />
        </Suspense>
        <Suspense fallback={null}>
          <MobileBottomNavigation />
        </Suspense>
      </div>

      {/* Nav2 - Right sidebar */}
      <Suspense fallback={<div className="hidden" aria-hidden="true" />}>
        <RightSidebar />
      </Suspense>
    </div>
  );
};
