import { formatTime, getCefrBadgeStyles, getDifficultyColor } from '@/shared/utils/string-utils';

export const WritingHelpers = {
  formatTime,
  getCefrBadgeStyles,
  getDifficultyColor,

  /**
   * Gets a letter icon or initials representing the discipline.
   */
  getDisciplineShort(discipline: string): string {
    if (discipline.includes('Software')) return 'SWE';
    if (discipline.includes('Database')) return 'DB';
    if (discipline.includes('Distributed')) return 'DS';
    return 'ENG';
  },
};
