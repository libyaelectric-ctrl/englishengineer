import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MascotState =
  | 'idle'
  | 'celebrate'
  | 'concerned'
  | 'thinking'
  | 'point'
  | 'streak'
  | 'levelUp'
  | 'streakDanger'
  | 'empty'
  | 'farewell'
  | 'sleeping';

interface MascotStore {
  state: MascotState;
  message: string | null;
  visible: boolean;
  minimized: boolean;
  // Corner-widget position, persisted so the user's drag placement sticks
  // across sessions. Stored as viewport-relative offsets from bottom-right.
  position: { right: number; bottom: number };
  soundEnabled: boolean;
  lastInteractionAt: number;

  setState: (state: MascotState, message?: string | null) => void;
  say: (message: string, state?: MascotState) => void;
  clearMessage: () => void;
  show: () => void;
  hide: () => void;
  toggleMinimized: () => void;
  setPosition: (position: { right: number; bottom: number }) => void;
  setSoundEnabled: (enabled: boolean) => void;
  touch: () => void;
}

export const useMascotStore = create<MascotStore>()(
  persist(
    (set) => ({
      state: 'idle',
      message: null,
      visible: true,
      minimized: false,
      position: { right: 22, bottom: 22 },
      soundEnabled: true,
      lastInteractionAt: Date.now(),

      setState: (state, message = null) => set({ state, message, lastInteractionAt: Date.now() }),
      say: (message, state) =>
        set((s) => ({ message, state: state ?? s.state, lastInteractionAt: Date.now() })),
      clearMessage: () => set({ message: null }),
      show: () => set({ visible: true }),
      hide: () => set({ visible: false }),
      toggleMinimized: () => set((s) => ({ minimized: !s.minimized })),
      setPosition: (position) => set({ position }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      touch: () => set({ lastInteractionAt: Date.now() }),
    }),
    {
      name: 'engvox-mascot',
      partialize: (s) => ({
        minimized: s.minimized,
        position: s.position,
        soundEnabled: s.soundEnabled,
      }),
    }
  )
);
