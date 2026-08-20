import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAdminStore } from '@/features/admin';

import { AdminHeader } from './AdminHeader';
import { BillingTab } from './BillingTab';
import { StatsGrid } from './StatsGrid';
import { SystemTab } from './SystemTab';
import { UsersTab } from './UsersTab';

const AUTO_REFRESH_INTERVAL_MS = 30_000; // 30 seconds

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'billing' | 'system'>('users');
  const navigate = useNavigate();

  const {
    users,
    systemLogs,
    stats,
    isLoadingUsers,
    isLoadingStats,
    isLoadingLogs,
    autoRefresh,
    lastRefreshedAt,
    toggleUserPlan,
    refreshAll,
    setAutoRefresh,
  } = useAdminStore();

  // Initial load + auto-refresh polling
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      refreshAll();
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, refreshAll]);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const isRefreshing = isLoadingUsers || isLoadingStats || isLoadingLogs;

  return (
    <div className="mx-auto w-full max-w-5xl animate-aurora-fade-in space-y-6 pt-12 sm:pt-0">
      <AdminHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        autoRefresh={autoRefresh}
        lastRefreshedAt={lastRefreshedAt}
        isRefreshing={isRefreshing}
        onToggleAutoRefresh={handleToggleAutoRefresh}
        onManualRefresh={refreshAll}
      />
      <StatsGrid stats={stats} isLoading={isLoadingStats} />
      {activeTab === 'users' && (
        <UsersTab users={users} onPromote={toggleUserPlan} isLoading={isLoadingUsers} />
      )}
      {activeTab === 'billing' && <BillingTab />}
      {activeTab === 'system' && <SystemTab systemLogs={systemLogs} isLoading={isLoadingLogs} />}
    </div>
  );
};

export default AdminPage;
