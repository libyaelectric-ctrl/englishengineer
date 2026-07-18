export const ListeningHelpers = {
  getAudioFormatLabel(audioUrl: string): string {
    const extension = audioUrl.split('.').pop()?.toUpperCase();
    return extension ? `${extension} audio` : 'Audio asset';
  },

  getAudioLoadFailureMessage(): string {
    return 'Audio asset could not be loaded. The file may be unavailable or the browser may be offline.';
  },

  normalizeDurationSeconds(
    browserDuration: number,
    metadataDuration: number
  ): number {
    if (Number.isFinite(browserDuration) && browserDuration > 0) {
      return Math.round(browserDuration);
    }
    return Math.max(1, Math.round(metadataDuration));
  },

  /**
   * Formats a duration in seconds to a "mm:ss" string.
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Retrieves Tailwind badge styling for CEFR levels.
   */
  getCefrBadgeStyles(level: string): string {
    switch (level.toUpperCase()) {
      case 'C2':
        return 'bg-purple-500/10 border border-purple-500/30 text-purple-400';
      case 'C1':
        return 'bg-primary/10 border border-primary/30 text-primary';
      case 'B2':
        return 'bg-engineer-cyan/10 border border-engineer-cyan/30 text-engineer-cyan';
      case 'B1':
      default:
        return 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400';
    }
  },

  /**
   * Retrieves status color string for progress bars or indicator dots based on difficulty.
   */
  getDifficultyColor(
    difficulty: string
  ): 'emerald' | 'amber' | 'rose' | 'primary' | 'cyan' {
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
