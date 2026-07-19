import { create } from 'zustand';
import { storage } from '@/shared/storage';

const THEME_VERSION = 2; // Bump to reset stale localStorage theme

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
  theme: (() => {
    // Reset stale theme from old auto-switch sessions
    const savedVersion = storage.get<number>('themeVersion');
    if (savedVersion !== THEME_VERSION) {
      storage.set('themeVersion', THEME_VERSION);
      storage.set('theme', getAutoTheme());
      return getAutoTheme();
    }
    const saved = storage.get<'dark' | 'light'>('theme');
    if (saved) return saved;
    return getAutoTheme();
  })(),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setTheme: (theme: 'dark' | 'light') => {
    storage.set('theme', theme);
    storage.set('themeVersion', THEME_VERSION);
    set({ theme });
  },
}));
