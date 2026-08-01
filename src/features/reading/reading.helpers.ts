import { formatTime, getCefrBadgeStyles } from '@/shared/utils/string-utils';

export const ReadingHelpers = {
  formatTime,
  getCefrBadgeStyles,

  /**
   * Retrieves status color string for progress bars or indicator dots based on difficulty.
   */
  getDifficultyColor(difficulty: string): 'emerald' | 'amber' | 'rose' | 'primary' | 'cyan' {
    switch (difficulty.toLowerCase()) {
      case 'advanced':
        return 'rose';
      case 'intermediate':
        return 'amber';
      case 'beginner':
      default:
        return 'emerald';
    }
  },

  /**
   * Gets a letter icon or initials representing the discipline.
   */
  getDisciplineShort(discipline: string): string {
    if (discipline.includes('Electrical')) return 'EE';
    if (discipline.includes('Systems')) return 'SE';
    return 'ENG';
  },
};
