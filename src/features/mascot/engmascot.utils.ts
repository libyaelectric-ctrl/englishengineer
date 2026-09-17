import type { MascotStateCopy } from '@/shared/localization/translations/mascot.translations';

export const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const getDisplayMessage = (
  m: string | null,
  s: string,
  c: MascotStateCopy,
  idleMsg: string
): string | null => {
  if (m) return m;
  if (s === 'thinking') return c.thinking;
  if (s === 'sleeping') return c.sleeping;
  if (s === 'empty') return c.empty;
  if (s === 'idle') return idleMsg;
  return null;
};
