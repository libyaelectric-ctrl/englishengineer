import { formatTime, getCefrBadgeStyles, getDifficultyColor } from '@/shared/utils/string-utils';

export const ReadingHelpers = {
  formatTime,
  getCefrBadgeStyles,
  getDifficultyColor,

  /**
   * Gets a letter icon or initials representing the discipline.
   */
  getDisciplineShort(discipline: string): string {
    if (discipline.includes('Electrical')) return 'EE';
    if (discipline.includes('Systems')) return 'SE';
    return 'ENG';
  },
};
