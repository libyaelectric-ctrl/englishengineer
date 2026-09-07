import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { eosGlobalPersistConfig } from '@/shared/storage/persist-middleware';
function getAutoTheme(): 'dark' | 'light' { const hour = new Date().getHours(); return hour >= 18 || hour < 6 ? 'dark' : 'light'; }
interface AppState { isSidebarOpen: boolean; isSidebarCollapsed: boolean; theme: 'dark' | 'light'; userOverride: boolean; toggleSidebar: () => void; toggleSidebarCollapsed: () => void; setTheme: (theme: 'dark' | 'light') => void; resetToAuto: () => void; }
export const useAppStore = create<AppState>()(persist((set) => ({ isSidebarOpen: false, isSidebarCollapsed: false, userOverride: false, theme: getAutoTheme(), toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })), toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })), setTheme: (theme) => set({ theme, userOverride: true }), resetToAuto: () => set({ theme: getAutoTheme(), userOverride: false }) }), eosGlobalPersistConfig('app_state', (state) => ({ theme: state.theme, userOverride: state.userOverride }))));
