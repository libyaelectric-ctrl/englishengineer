import { formatTime, getCefrBadgeStyles } from '@/shared/utils/string-utils';

export const WritingHelpers = {
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
    if (discipline.includes('Software')) return 'SWE';
    if (discipline.includes('Database')) return 'DB';
    if (discipline.includes('Distributed')) return 'DS';
    return 'ENG';
  },
};
