import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { BetaAnalyticsTracker, BetaFeedbackWidget } from '@/features/beta';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { useAppStore } from '@/store/app.store';
import { Menu } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { toggleSidebar } = useAppStore();

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
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
        <main className="custom-scrollbar flex-1 scroll-smooth overflow-y-auto p-4 pb-28 pt-12 sm:p-6 sm:pb-28 sm:pt-12 lg:p-8 lg:pb-8 lg:pt-4">
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
