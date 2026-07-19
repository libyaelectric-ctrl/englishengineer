import { create } from 'zustand';
import { storage } from '@/shared/storage';

function getAutoTheme(): 'dark' | 'light' {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
}

interface AppState {
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  autoTheme: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setAutoTheme: (auto: boolean) => void;
  applyAutoTheme: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isSidebarOpen: false,
  autoTheme: storage.get<boolean>('autoTheme') ?? true,
  theme: (() => {
    const auto = storage.get<boolean>('autoTheme') ?? true;
    if (auto) return getAutoTheme();
    return (storage.get<'dark' | 'light'>('theme') || 'light') as 'dark' | 'light';
  })(),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setTheme: (theme: 'dark' | 'light') => {
    storage.set('theme', theme);
    storage.set('autoTheme', false);
    set({ theme, autoTheme: false });
  },
  setAutoTheme: (auto: boolean) => {
    storage.set('autoTheme', auto);
    if (auto) {
      const detected = getAutoTheme();
      storage.set('theme', detected);
      set({ autoTheme: auto, theme: detected });
    } else {
      set({ autoTheme: auto });
    }
  },
  applyAutoTheme: () => {
    if (get().autoTheme) {
      const detected = getAutoTheme();
      storage.set('theme', detected);
      set({ theme: detected });
    }
  },
}));
