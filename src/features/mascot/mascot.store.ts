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

export type SoundVolume = 'off' | 'low' | 'high';

interface MascotStore {
  state: MascotState;
  message: string | null;
  visible: boolean;
  minimized: boolean;
  position: { right: number; bottom: number };
  soundEnabled: boolean;
  soundVolume: SoundVolume;
  toastEnabled: boolean;
  contrastMode: boolean;
  lastInteractionAt: number;

  setState: (state: MascotState, message?: string | null) => void;
  say: (message: string, state?: MascotState) => void;
  clearMessage: () => void;
  show: () => void;
  hide: () => void;
  toggleMinimized: () => void;
  setPosition: (position: { right: number; bottom: number }) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: SoundVolume) => void;
  setToastEnabled: (enabled: boolean) => void;
  toggleContrastMode: () => void;
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
      soundVolume: 'high',
      toastEnabled: true,
      contrastMode: false,
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
      setSoundVolume: (volume) => set({ soundVolume: volume, soundEnabled: volume !== 'off' }),
      setToastEnabled: (enabled) => set({ toastEnabled: enabled }),
      toggleContrastMode: () => set((s) => ({ contrastMode: !s.contrastMode })),
      touch: () => set({ lastInteractionAt: Date.now() }),
    }),
    {
      name: 'engvox-mascot',
      partialize: (s) => ({
        minimized: s.minimized,
        position: s.position,
        soundEnabled: s.soundEnabled,
        soundVolume: s.soundVolume,
        toastEnabled: s.toastEnabled,
        contrastMode: s.contrastMode,
      }),
    }
  )
);
