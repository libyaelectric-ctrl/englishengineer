import { create } from 'zustand';
import { storage } from '@/shared/storage';

function getAutoTheme(): 'dark' | 'light' {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
}

interface AppState {
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  userOverride: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  resetToAuto: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  userOverride: storage.get<boolean>('themeOverride') ?? false,
  theme: (() => {
    if (storage.get<boolean>('themeOverride')) {
      return (storage.get<'dark' | 'light'>('themeManual') || getAutoTheme()) as 'dark' | 'light';
    }
    return getAutoTheme();
  })(),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setTheme: (theme: 'dark' | 'light') => {
    storage.set('themeManual', theme);
    storage.set('themeOverride', true);
    set({ theme, userOverride: true });
  },
  resetToAuto: () => {
    storage.set('themeOverride', false);
    storage.remove('themeManual');
    set({ theme: getAutoTheme(), userOverride: false });
  },
}));
