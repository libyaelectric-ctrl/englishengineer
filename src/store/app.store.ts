import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { eosPersistConfig } from '@/shared/storage/persist-middleware';

function getAutoTheme(): 'dark' | 'light' {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
}

interface AppState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  userOverride: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  resetToAuto: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      isSidebarCollapsed: false,
      userOverride: false,
      theme: getAutoTheme(),
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      toggleSidebarCollapsed: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      setTheme: (theme: 'dark' | 'light') => set({ theme, userOverride: true }),
      resetToAuto: () => set({ theme: getAutoTheme(), userOverride: false }),
    }),
    eosPersistConfig('app_state', (s) => ({ theme: s.theme, userOverride: s.userOverride }))
  )
);
