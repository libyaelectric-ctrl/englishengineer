export type ReadingStatus = 'new' | 'read' | 'completed';

export interface ReadingProgress {
  contentId: string;
  status: ReadingStatus;
  score: number;
  timesRead: number;
  lastReadAt: string | null;
}

export const ReadingProgressService = {
  onFirstRead(current: ReadingProgress): ReadingProgress {
    return {
      ...current,
      status: 'read',
      timesRead: current.timesRead + 1,
      lastReadAt: new Date().toISOString(),
    };
  },

  onComplete(current: ReadingProgress, score: number): ReadingProgress {
    return {
      ...current,
      status: 'completed',
      score,
      timesRead: current.timesRead + 1,
      lastReadAt: new Date().toISOString(),
    };
  },

  getProgressColor(status: ReadingStatus): string {
    switch (status) {
      case 'read': return 'green';
      case 'completed': return 'gold';
      default: return 'gray';
    }
  },
};
