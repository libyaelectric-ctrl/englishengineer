import { LogOut, RefreshCw, Settings, Shield, Users, Wallet } from 'lucide-react';

import { Button } from '@/shared/components/Button';

interface AdminHeaderProps {
  activeTab: 'users' | 'billing' | 'system';
  onTabChange: (tab: 'users' | 'billing' | 'system') => void;
  onLogout: () => void;
  autoRefresh: boolean;
  lastRefreshedAt: string | null;
  isRefreshing: boolean;
  onToggleAutoRefresh: () => void;
  onManualRefresh: () => void;
}

const formatTimeSince = (iso: string | null): string => {
  if (!iso) return 'Never';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

export const AdminHeader = ({
  activeTab,
  onTabChange,
  onLogout,
  autoRefresh,
  lastRefreshedAt,
  isRefreshing,
  onToggleAutoRefresh,
  onManualRefresh,
}: AdminHeaderProps) => {
  return (
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
          <Button variant="ghost" size="sm" onClick={onLogout} className="mt-2 text-xs">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-surface-hover transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onToggleAutoRefresh}
              className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                autoRefresh
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600'
                  : 'border-border-soft bg-surface text-muted-copy hover:bg-surface-hover'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-muted-copy/50'}`}
              />
              Auto {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <span className="text-[10px] font-bold text-muted-copy">
              {formatTimeSince(lastRefreshedAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'users' ? 'primary' : 'outline'}
            onClick={() => onTabChange('users')}
          >
            <Users className="h-4 w-4" /> Users
          </Button>
          <Button
            variant={activeTab === 'billing' ? 'primary' : 'outline'}
            onClick={() => onTabChange('billing')}
          >
            <Wallet className="h-4 w-4" /> Billing
          </Button>
          <Button
            variant={activeTab === 'system' ? 'primary' : 'outline'}
            onClick={() => onTabChange('system')}
          >
            <Settings className="h-4 w-4" /> System
          </Button>
        </div>
      </div>
    </header>
  );
};
