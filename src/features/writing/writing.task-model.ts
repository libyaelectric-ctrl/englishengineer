import type { CefrLevel } from '@/features/level-system';

export type WritingTaskFormat =
  | 'sentence'
  | 'message'
  | 'email'
  | 'report'
  | 'claim';

export const getWritingTaskFormats = (
  level: CefrLevel
): WritingTaskFormat[] => {
  if (level === 'A1' || level === 'A2') return ['sentence', 'message'];
  if (level === 'B1' || level === 'B2') return ['message', 'email', 'report'];
  return ['report', 'claim'];
};
