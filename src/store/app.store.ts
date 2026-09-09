import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { eosGlobalPersistConfig } from '@/shared/storage/persist-middleware';

interface AppState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleSidebarCollapsed: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    eosGlobalPersistConfig('app_state', (state) => ({
      isSidebarOpen: state.isSidebarOpen,
      isSidebarCollapsed: state.isSidebarCollapsed,
    }))
  )
);
