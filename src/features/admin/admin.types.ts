export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  discipline: string;
  level: string;
  plan: string;
  joinedAt: string;
}

export interface AdminSystemLog {
  id: string;
  time: string;
  type: 'info' | 'warning' | 'error';
  msg: string;
  action?: string;
  userId?: string;
  severity?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  proMembers: number;
  aiRequestCount: number;
  performance: {
    requestCount: number;
    errorCount: number;
    errorRate: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
  };
  system: {
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    version: string;
  };
}

export interface AdminState {
  users: AdminUserRecord[];
  systemLogs: AdminSystemLog[];
  stats: AdminStats | null;
  isLoadingUsers: boolean;
  isLoadingLogs: boolean;
  isLoadingStats: boolean;
  error: string | null;
  autoRefresh: boolean;
  lastRefreshedAt: string | null;
}
