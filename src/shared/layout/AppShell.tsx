import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BetaAnalyticsTracker, BetaFeedbackWidget } from '@/features/beta';
import { MobileBottomNavigation } from './MobileBottomNavigation';

export const AppShell: React.FC = () => {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background text-slate-950">
      <Sidebar />
      <div className="relative z-10 flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <BetaAnalyticsTracker />
        <Topbar />
        <main className="custom-scrollbar flex-1 scroll-smooth overflow-y-auto border-r border-slate-300 p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8 xl:p-10">
          <Outlet />
        </main>
        <BetaFeedbackWidget />
        <MobileBottomNavigation />
      </div>
    </div>
  );
};
