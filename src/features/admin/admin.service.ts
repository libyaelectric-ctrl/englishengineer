import { logger } from '@/shared/logger';
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '@/shared/services/auth-backend/supabase.client';
import { getBackendAuthHeaders } from '@/shared/services/backend-auth.service';

import type { AdminStats, AdminSystemLog, AdminUserRecord } from './admin.types';

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  activeToday: 0,
  proMembers: 0,
  aiRequestCount: 0,
  performance: {
    requestCount: 0,
    errorCount: 0,
    errorRate: 0,
    avgDuration: 0,
    p95Duration: 0,
    p99Duration: 0,
  },
  system: {
    uptime: 0,
    memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
    version: '0.0.0',
  },
};

const mapSupabaseUser = (row: {
  id: string;
  email: string;
  display_name: string;
  engineering_discipline: string;
  target_level: string;
  role: string;
  created_at: string;
}): AdminUserRecord => ({
  id: row.id,
  name: row.display_name || 'Unknown',
  email: row.email || '',
  discipline: row.engineering_discipline || 'Engineering',
  level: row.target_level || '—',
  plan: row.role || 'free',
  joinedAt: row.created_at || new Date().toISOString(),
});

const mapAuditLog = (entry: {
  id: string;
  timestamp: string;
  action?: string;
  userId?: string;
  details?: Record<string, unknown>;
  severity?: string;
  message?: string;
}): AdminSystemLog => {
  const severity = entry.severity || 'info';
  const type: AdminSystemLog['type'] =
    severity === 'critical' || severity === 'error'
      ? 'error'
      : severity === 'warning'
        ? 'warning'
        : 'info';

  const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return {
    id: entry.id,
    time,
    type,
    msg: entry.message || entry.action || 'Unknown event',
    action: entry.action,
    userId: entry.userId,
    severity: entry.severity,
  };
};

export const AdminService = {
  async fetchUsers(): Promise<AdminUserRecord[]> {
    if (!isSupabaseConfigured()) return [];

    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, engineering_discipline, target_level, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        logger.e('Failed to fetch admin users:', error.message);
        return [];
      }

      return (data || []).map(mapSupabaseUser);
    } catch {
      return [];
    }
  },

  async fetchStats(): Promise<AdminStats> {
    const isBackendConfigured = !!(
      import.meta.env.VITE_AI_PROXY_URL || import.meta.env.VITE_BACKEND_URL
    );

    if (!isBackendConfigured) return EMPTY_STATS;

    try {
      const base =
        (import.meta.env.VITE_AI_PROXY_URL || import.meta.env.VITE_BACKEND_URL || '')
          .replace(/\/api\/(?:v1\/)?ai\/?$/, '')
          .replace(/\/$/, '') || '';

      if (!base) return EMPTY_STATS;

      const authHeaders = await getBackendAuthHeaders();
      const response = await fetch(`${base}/api/admin/stats`, {
        method: 'GET',
        headers: authHeaders,
      });

      if (!response.ok) return EMPTY_STATS;

      const payload = (await response.json()) as {
        success: boolean;
        data?: {
          performance: AdminStats['performance'];
          system: AdminStats['system'];
        };
      };

      if (!payload.success || !payload.data) return EMPTY_STATS;

      // Backend stats don't include user counts; those come from Supabase
      const users = await AdminService.fetchUsers();
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return {
        totalUsers: users.length,
        activeToday: users.filter((u) => new Date(u.joinedAt).getTime() >= todayStart.getTime())
          .length,
        proMembers: users.filter(
          (u) => u.plan === 'senior' || u.plan === 'master' || u.plan === 'team'
        ).length,
        aiRequestCount: payload.data.performance.requestCount,
        performance: payload.data.performance,
        system: payload.data.system,
      };
    } catch {
      return EMPTY_STATS;
    }
  },

  async fetchSystemLogs(limit = 50): Promise<AdminSystemLog[]> {
    const isBackendConfigured = !!(
      import.meta.env.VITE_AI_PROXY_URL || import.meta.env.VITE_BACKEND_URL
    );

    if (!isBackendConfigured) return [];

    try {
      const base =
        (import.meta.env.VITE_AI_PROXY_URL || import.meta.env.VITE_BACKEND_URL || '')
          .replace(/\/api\/(?:v1\/)?ai\/?$/, '')
          .replace(/\/$/, '') || '';

      if (!base) return [];

      const authHeaders = await getBackendAuthHeaders();
      const response = await fetch(`${base}/api/admin/audit-logs?limit=${limit}`, {
        method: 'GET',
        headers: authHeaders,
      });

      if (!response.ok) return [];

      const payload = (await response.json()) as {
        success: boolean;
        data?: Array<{
          id: string;
          timestamp: string;
          action?: string;
          userId?: string;
          details?: Record<string, unknown>;
          severity?: string;
          message?: string;
        }>;
      };

      if (!payload.success || !payload.data) return [];

      return payload.data.map(mapAuditLog);
    } catch {
      return [];
    }
  },
};
