import { type FC, lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { BetaAnalyticsTracker, BetaFeedbackWidget } from '@/features/beta';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { useAppStore } from '@/store/app.store';
import { Menu } from 'lucide-react';

const CommandPalette = lazy(() => import('@/shared/components/CommandPalette'));

export const AppShell: FC = () => {
  const { toggleSidebar } = useAppStore();

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      {/* Nav1 - Left sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="relative z-10 flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <BetaAnalyticsTracker />
        <button
          onClick={toggleSidebar}
          className="fixed left-2 top-2 z-50 cursor-pointer rounded-lg p-2 text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground lg:hidden"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <main className="custom-scrollbar flex-1 scroll-smooth overflow-y-auto px-4 pb-28 sm:px-6 sm:pb-28 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
        <BetaFeedbackWidget />
        <MobileBottomNavigation />
      </div>

      {/* Nav2 - Right sidebar */}
      <RightSidebar />
    </div>
  );
};
