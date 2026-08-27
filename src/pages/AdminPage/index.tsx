/**
 * Admin Page — Modern Single Page Design
 *
 * All sections scroll vertically:
 * 1. Command Console Header (status, refresh controls)
 * 2. Stats Grid
 * 3. Users Table
 * 4. Billing Overview
 * 5. System Logs
 */

import { useEffect } from 'react';

import {
  LogOut,
  RefreshCw,
  Settings,
  Shield,
  Users,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/Button';
import { PageContainer } from '@/shared/components/PageContainer';

import { useAdminStore } from '@/features/admin';
import { CLERK_SIGN_IN_URL } from '@/features/auth/clerk.config';

import { BillingTab } from './BillingTab';
import { StatsGrid } from './StatsGrid';
import { SystemTab } from './SystemTab';
import { UsersTab } from './UsersTab';

const AUTO_REFRESH_INTERVAL_MS = 30_000;

const formatTimeSince = (iso: string | null): string => {
  if (!iso) return 'Never';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

export const AdminPage = () => {
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

  const handleLogout = () => navigate(CLERK_SIGN_IN_URL);
  const isRefreshing = isLoadingUsers || isLoadingStats || isLoadingLogs;

  return (
    <PageContainer className="w-full animate-aurora-fade-in space-y-6 pt-12 sm:pt-0">
      {/* ─── Command Console Header ─────────────────────── */}
      <header className="premium-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600">
                Authorized Access Only
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">EngVox Command Console</h1>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => window.location.assign('/dashboard')} className="text-xs">
                ← Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={refreshAll}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-2.5 py-1 min-h-11 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 min-h-11 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                  autoRefresh
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600'
                    : 'border-border-soft bg-surface text-muted-copy hover:bg-surface-hover'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-muted-copy/50'}`} />
                Auto {autoRefresh ? 'ON' : 'OFF'}
              </button>
              <span className="text-[10px] font-bold text-muted-copy">
                {formatTimeSince(lastRefreshedAt)}
              </span>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <div className="flex flex-wrap gap-2">
            <a href="#stats" className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all">
              <Shield className="h-3 w-3" /> Stats
            </a>
            <a href="#users" className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all">
              <Users className="h-3 w-3" /> Users
            </a>
            <a href="#billing" className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all">
              <Wallet className="h-3 w-3" /> Billing
            </a>
            <a href="#system" className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all">
              <Settings className="h-3 w-3" /> System
            </a>
          </div>
        </div>
      </header>

      {/* ─── Stats Grid ─────────────────────────────────── */}
      <div id="stats">
        <StatsGrid stats={stats} isLoading={isLoadingStats} />
      </div>

      {/* ─── Users ──────────────────────────────────────── */}
      <div id="users">
        <UsersTab users={users} onPromote={toggleUserPlan} isLoading={isLoadingUsers} />
      </div>

      {/* ─── Billing ────────────────────────────────────── */}
      <div id="billing">
        <BillingTab />
      </div>

      {/* ─── System Logs ────────────────────────────────── */}
      <div id="system">
        <SystemTab systemLogs={systemLogs} isLoading={isLoadingLogs} />
      </div>
    </PageContainer>
  );
};

export default AdminPage;
