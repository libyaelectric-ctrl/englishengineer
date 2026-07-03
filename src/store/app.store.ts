import { create } from 'zustand';
import { storage } from '@/shared/storage';

interface AppState {
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  theme: storage.get<'dark' | 'light'>('theme') || 'light',
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setTheme: (theme: 'dark' | 'light') => {
    storage.set('theme', theme);
    set({ theme });
  },
}));
