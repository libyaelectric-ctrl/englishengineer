import { create } from 'zustand';

import { AdminService } from './admin.service';
import type { AdminState } from './admin.types';

interface AdminActions {
  fetchUsers: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchSystemLogs: (limit?: number) => Promise<void>;
  toggleUserPlan: (userId: string) => void;
  refreshAll: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
}

export const useAdminStore = create<AdminState & AdminActions>((set, get) => ({
  users: [],
  systemLogs: [],
  stats: null,
  isLoadingUsers: false,
  isLoadingLogs: false,
  isLoadingStats: false,
  error: null,
  autoRefresh: true,
  lastRefreshedAt: null,

  fetchUsers: async () => {
    set({ isLoadingUsers: true, error: null });
    try {
      const users = await AdminService.fetchUsers();
      set({ users, isLoadingUsers: false });
    } catch (err) {
      set({
        isLoadingUsers: false,
        error: err instanceof Error ? err.message : 'Failed to fetch users',
      });
    }
  },

  fetchStats: async () => {
    set({ isLoadingStats: true, error: null });
    try {
      const stats = await AdminService.fetchStats();
      set({ stats, isLoadingStats: false });
    } catch (err) {
      set({
        isLoadingStats: false,
        error: err instanceof Error ? err.message : 'Failed to fetch stats',
      });
    }
  },

  fetchSystemLogs: async (limit = 50) => {
    set({ isLoadingLogs: true, error: null });
    try {
      const systemLogs = await AdminService.fetchSystemLogs(limit);
      set({ systemLogs, isLoadingLogs: false });
    } catch (err) {
      set({
        isLoadingLogs: false,
        error: err instanceof Error ? err.message : 'Failed to fetch system logs',
      });
    }
  },

  toggleUserPlan: (userId: string) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, plan: u.plan === 'senior' ? 'junior' : 'senior' } : u
      ),
    }));
  },

  refreshAll: async () => {
    const { fetchUsers, fetchStats, fetchSystemLogs } = get();
    await Promise.allSettled([fetchUsers(), fetchStats(), fetchSystemLogs()]);
    set({ lastRefreshedAt: new Date().toISOString() });
  },

  setAutoRefresh: (enabled: boolean) => {
    set({ autoRefresh: enabled });
  },
}));
