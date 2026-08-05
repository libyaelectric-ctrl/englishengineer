import { useState } from 'react';

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

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr_demo_001',
    name: 'Demo User A',
    email: 'user.a@example.com',
    discipline: 'Electrical Engineering',
    level: 'B2',
    elo: 1680,
    plan: 'senior',
    joinedAt: '2026-07-01',
  },
  {
    id: 'usr_demo_002',
    name: 'Demo Engineer',
    email: 'demo.engineer@example.com',
    discipline: 'Mechanical Engineering',
    level: 'A2',
    elo: 1210,
    plan: 'junior',
    joinedAt: '2026-07-05',
  },
  {
    id: 'usr_demo_003',
    name: 'Demo User C',
    email: 'user.c@example.com',
    discipline: 'Civil Engineering',
    level: 'C1',
    elo: 1890,
    plan: 'senior',
    joinedAt: '2026-07-06',
  },
  {
    id: 'usr_demo_004',
    name: 'Demo User D',
    email: 'user.d@example.com',
    discipline: 'Mechanical Engineering',
    level: 'B1',
    elo: 1420,
    plan: 'senior',
    joinedAt: '2026-07-08',
  },
];

const SYSTEM_LOGS = [
  {
    id: 1,
    time: '10:04:12',
    type: 'info' as const,
    msg: 'Stripe webhook checkout.session.completed received',
  },
  {
    id: 2,
    time: '09:48:02',
    type: 'info' as const,
    msg: 'User logged in successfully',
  },
  {
    id: 3,
    time: '09:12:44',
    type: 'warning' as const,
    msg: 'AI rate limit warning triggered for user',
  },
  {
    id: 4,
    time: '08:05:04',
    type: 'info' as const,
    msg: 'Production database health-check OK',
  },
];

export const AdminPage = () => {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<'users' | 'billing' | 'system'>('users');

  const handleLogout = () => {
    window.location.href = '/login';
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
