import { create } from 'zustand';
import { storage } from '@/shared/storage';

function getAutoTheme(): 'dark' | 'light' {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
}

interface AppState {
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  // If user never clicked toggle → use time-based auto theme.
  // If they did → use their saved choice.
  theme: (() => {
    const saved = storage.get<'dark' | 'light'>('theme');
    if (saved) return saved;
    return getAutoTheme();
  })(),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setTheme: (theme: 'dark' | 'light') => {
    storage.set('theme', theme);
    set({ theme });
  },
}));
