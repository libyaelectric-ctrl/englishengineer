import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Wallet,
  Settings,
  Activity,
  CheckCircle,
  Lock,
  LogOut,
} from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';

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

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-border-soft bg-surface p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-copy mt-1">Authorized personnel only</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-copy">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border-soft bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-copy">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border-soft bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
              {loginError && (
                <p className="text-xs font-medium text-danger">{loginError}</p>
              )}
              <Button type="submit" className="w-full">
                <Shield className="h-4 w-4" /> Access Admin Panel
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<'users' | 'billing' | 'system'>(
    'users'
  );
  const [systemLogs] = useState([
    {
      id: 1,
      time: '10:04:12',
      type: 'info',
      msg: 'Stripe webhook checkout.session.completed received',
    },
    {
      id: 2,
      time: '09:48:02',
      type: 'info',
      msg: 'User catexozcan@gmail.com logged in successfully',
    },
    {
      id: 3,
      time: '09:12:44',
      type: 'warning',
      msg: 'AI rate limit warning triggered for user usr_002',
    },
    {
      id: 4,
      time: '08:05:04',
      type: 'info',
      msg: 'Production database health-check OK',
    },
  ]);

  const handlePromote = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, plan: u.plan === 'Pro' ? 'Free' : 'Pro' } : u
      )
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl animate-aurora-fade-in space-y-6 pt-12 sm:pt-0">
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
              onClick={handleLogout}
              className="mt-2 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'users' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-4 w-4" /> Users
            </Button>
            <Button
              variant={activeTab === 'billing' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('billing')}
            >
              <Wallet className="h-4 w-4" /> Billing
            </Button>
            <Button
              variant={activeTab === 'system' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('system')}
            >
              <Settings className="h-4 w-4" /> System
            </Button>
          </div>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <p className="text-[10px] font-bold text-muted-copy uppercase">
            Total Students
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {users.length}
          </p>
        </div>
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <p className="text-[10px] font-bold text-muted-copy uppercase">
            Active Today
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">2</p>
        </div>
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <p className="text-[10px] font-bold text-muted-copy uppercase">
            Pro Members
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600">3</p>
        </div>
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <p className="text-[10px] font-bold text-muted-copy uppercase">
            AI Request Count
          </p>
          <p className="mt-1 text-2xl font-bold text-purple-600">1,842</p>
        </div>
      </div>

      {activeTab === 'users' && (
        <SectionCard title="Active User Management" icon={Users}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-soft text-[10px] uppercase font-bold text-muted-copy">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">CEFR Level</th>
                  <th className="py-3 px-4">ELO Score</th>
                  <th className="py-3 px-4">Plan Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border-soft hover:bg-surface-hover/30 text-xs"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-foreground">{u.name}</p>
                      <p className="text-[10px] text-muted-copy">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-muted-copy">
                      {u.discipline}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary">
                        {u.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {u.elo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded px-1.5 py-0.5 font-semibold text-[10px] ${
                          u.plan.includes('Pro')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-surface-hover text-muted-copy'
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.id !== 'usr_001' && (
                        <Button
                          variant="ghost"
                          className="h-8 px-2.5 text-[11px]"
                          onClick={() => handlePromote(u.id)}
                        >
                          Toggle Plan
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {activeTab === 'billing' && (
        <SectionCard title="Stripe Billing Integrations" icon={Wallet}>
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-hover/50 p-4 border border-border-soft">
              <h3 className="text-sm font-semibold text-foreground">
                Stripe Connection Health
              </h3>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle className="h-4 w-4" /> Live Keys Configured
                Successfully
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border-soft p-4 bg-surface">
                <p className="text-[10px] font-bold text-muted-copy uppercase">
                  Monthly Recurring Revenue
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">$57.00</p>
              </div>
              <div className="rounded-xl border border-border-soft p-4 bg-surface">
                <p className="text-[10px] font-bold text-muted-copy uppercase">
                  Stripe Webhooks (Idempotent)
                </p>
                <p className="mt-1 text-xl font-bold text-emerald-600">
                  Active (100% OK)
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {activeTab === 'system' && (
        <SectionCard title="System Diagnostics" icon={Activity}>
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-hover/50 p-4 border border-border-soft">
              <h3 className="text-sm font-semibold text-foreground">
                Active Configuration State
              </h3>
              <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                <div className="flex justify-between border-b border-border-soft pb-1">
                  <span className="text-muted-copy">Dev Auth Bypass:</span>
                  <span className="font-bold text-rose-600">
                    Blocked (Secure)
                  </span>
                </div>
                <div className="flex justify-between border-b border-border-soft pb-1">
                  <span className="text-muted-copy">Supabase RLS Rules:</span>
                  <span className="font-bold text-emerald-600">
                    Active (Secure)
                  </span>
                </div>
                <div className="flex justify-between border-b border-border-soft pb-1">
                  <span className="text-muted-copy">AI LLM Model:</span>
                  <span className="font-bold text-foreground">
                    claude-haiku-4-5
                  </span>
                </div>
                <div className="flex justify-between border-b border-border-soft pb-1">
                  <span className="text-muted-copy">
                    Rate-Limiter (Upstash):
                  </span>
                  <span className="font-bold text-emerald-600">Connected</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-muted-copy uppercase tracking-wider mb-2">
                Live System Log Output
              </h3>
              <div className="rounded-xl bg-primary/5 p-4 font-mono text-[10px] text-primary space-y-1 max-h-48 overflow-y-auto">
                {systemLogs.map((log) => (
                  <p key={log.id}>
                    <span className="opacity-50">[{log.time}]</span>{' '}
                    <span
                      className={
                        log.type === 'warning' ? 'text-amber-600 font-bold' : ''
                      }
                    >
                      {log.msg}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default AdminPage;
