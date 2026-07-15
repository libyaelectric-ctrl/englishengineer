import React from 'react';
import { Shield, Users, Wallet, Settings, LogOut } from 'lucide-react';
import { Button } from '@/shared/components/Button';

interface AdminHeaderProps {
  activeTab: 'users' | 'billing' | 'system';
  onTabChange: (tab: 'users' | 'billing' | 'system') => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onTabChange,
  onLogout,
}) => {
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
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            EngineerOS Command Console
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="mt-2 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
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