import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AdminHeader } from './AdminHeader';
import { BillingTab } from './BillingTab';
import { StatsGrid } from './StatsGrid';
import { SystemTab } from './SystemTab';
import { UsersTab } from './UsersTab';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  discipline: string;
  level: string;
  elo: number;
  plan: string;
  joinedAt: string;
}

const INITIAL_USERS: UserRecord[] = [];

const SYSTEM_LOGS: Array<{ id: number; time: string; type: 'info' | 'warning'; msg: string }> = [];

export const AdminPage = () => {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<'users' | 'billing' | 'system'>('users');

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handlePromote = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, plan: u.plan === 'senior' ? 'junior' : 'senior' } : u))
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl animate-aurora-fade-in space-y-6 pt-12 sm:pt-0">
      <AdminHeader activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <StatsGrid totalStudents={users.length} />
      {activeTab === 'users' && <UsersTab users={users} onPromote={handlePromote} />}
      {activeTab === 'billing' && <BillingTab />}
      {activeTab === 'system' && <SystemTab systemLogs={SYSTEM_LOGS} />}
    </div>
  );
};

export default AdminPage;
