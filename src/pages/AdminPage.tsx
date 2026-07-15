import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminPage/AdminLogin';
import { AdminHeader } from './AdminPage/AdminHeader';
import { StatsGrid } from './AdminPage/StatsGrid';
import { UsersTab } from './AdminPage/UsersTab';
import { BillingTab } from './AdminPage/BillingTab';
import { SystemTab } from './AdminPage/SystemTab';

const ADMIN_USERNAME = 'ozcaneymen';
const ADMIN_PASSWORD = '08022010';
const ADMIN_SESSION_KEY = 'eos_admin_auth';

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
    id: 'usr_001',
    name: 'Özcan Erensayın',
    email: 'catexozcan@gmail.com',
    discipline: 'Electrical Engineering',
    level: 'B2',
    elo: 1680,
    plan: 'Pro (Admin)',
    joinedAt: '2026-07-01',
  },
  {
    id: 'usr_002',
    name: 'Demo Engineer',
    email: 'demo.engineer@local.engvox',
    discipline: 'Mechanical Engineering',
    level: 'A2',
    elo: 1210,
    plan: 'Free',
    joinedAt: '2026-07-05',
  },
  {
    id: 'usr_003',
    name: 'Sarah Smith',
    email: 'sarah.s@globalinfra.com',
    discipline: 'Civil Engineering',
    level: 'C1',
    elo: 1890,
    plan: 'Pro',
    joinedAt: '2026-07-06',
  },
  {
    id: 'usr_004',
    name: 'Hiroshi Tanaka',
    email: 'tanaka.h@automation.jp',
    discipline: 'Mechanical Engineering',
    level: 'B1',
    elo: 1420,
    plan: 'Pro',
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
    msg: 'User catexozcan@gmail.com logged in successfully',
  },
  {
    id: 3,
    time: '09:12:44',
    type: 'warning' as const,
    msg: 'AI rate limit warning triggered for user usr_002',
  },
  {
    id: 4,
    time: '08:05:04',
    type: 'info' as const,
    msg: 'Production database health-check OK',
  },
];

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<'users' | 'billing' | 'system'>(
    'users'
  );

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handlePromote = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, plan: u.plan === 'Pro' ? 'Free' : 'Pro' } : u
      )
    );
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        username={username}
        password={password}
        loginError={loginError}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl animate-aurora-fade-in space-y-6 pt-12 sm:pt-0">
      <AdminHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      <StatsGrid totalStudents={users.length} />
      {activeTab === 'users' && (
        <UsersTab users={users} onPromote={handlePromote} />
      )}
      {activeTab === 'billing' && <BillingTab />}
      {activeTab === 'system' && <SystemTab systemLogs={SYSTEM_LOGS} />}
    </div>
  );
};

export default AdminPage;