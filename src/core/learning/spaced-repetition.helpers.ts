import { CEFR_LEVELS } from '@/features/level-system/level-system.types';
import type { CefrLevel } from '@/features/level-system/level-system.types';

export const getLevelsThrough = (level: CefrLevel): CefrLevel[] =>
  CEFR_LEVELS.slice(0, CEFR_LEVELS.indexOf(level) + 1);

export const isCefrAtOrBelow = (
  candidate: CefrLevel,
  ceiling: CefrLevel
): boolean => CEFR_LEVELS.indexOf(candidate) <= CEFR_LEVELS.indexOf(ceiling);

export const includesNormalized = (
  values: string[],
  expected: string
): boolean =>
  values.some(
    (value) => value.trim().toLowerCase() === expected.trim().toLowerCase()
  );

export const extractCefrFromId = (id: string): CefrLevel | null => {
  const match = id.toUpperCase().match(/_(A1|A2|B1|B2|C1|C2)_/);
  return match ? (match[1] as CefrLevel) : null;
};
