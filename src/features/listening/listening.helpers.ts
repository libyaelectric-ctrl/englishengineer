import { formatTime, getCefrBadgeStyles } from '@/shared/utils/string-utils';

export const ListeningHelpers = {
  getAudioFormatLabel(audioUrl: string): string {
    const extension = audioUrl.split('.').pop()?.toUpperCase();
    return extension ? `${extension} audio` : 'Audio asset';
  },

  getAudioLoadFailureMessage(): string {
    return 'Audio asset could not be loaded. The file may be unavailable or the browser may be offline.';
  },

  normalizeDurationSeconds(browserDuration: number, metadataDuration: number): number {
    if (Number.isFinite(browserDuration) && browserDuration > 0) {
      return Math.round(browserDuration);
    }
    return Math.max(1, Math.round(metadataDuration));
  },

  formatTime,
  getCefrBadgeStyles,

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

  getDisciplineShort(discipline: string): string {
    const mappings: [string, string][] = [
      ['Electrical', 'EE'],
      ['Design', 'DES'],
      ['Power', 'PWR'],
      ['Quality', 'QA'],
      ['Operations', 'O&M'],
      ['Field', 'FLD'],
      ['Testing', 'TST'],
      ['Safety', 'SFT'],
      ['Project', 'PM'],
      ['Mechanical', 'ME'],
    ];
    const match = mappings.find(([keyword]) => discipline.includes(keyword));
    return match ? match[1] : 'ENG';
  },
};
