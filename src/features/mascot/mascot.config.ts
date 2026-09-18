export const SLEEP_AFTER_MS = 120_000;

export const stateToastMap: Record<string, { icon: string; type: 'info' | 'success' | 'error' }> = {
  celebrate: { icon: '🎉', type: 'success' },
  levelUp: { icon: '⬆️', type: 'success' },
  streak: { icon: '🔥', type: 'success' },
  thinking: { icon: '💭', type: 'info' },
  sleeping: { icon: '😴', type: 'info' },
  empty: { icon: '😐', type: 'info' },
  concerned: { icon: '😟', type: 'error' },
  streakDanger: { icon: '⚠️', type: 'error' },
};

export const volumeToNumber = (volume: 'off' | 'low' | 'high'): number => {
  switch (volume) {
    case 'off':
      return 0;
    case 'low':
      return 0.08;
    case 'high':
      return 0.15;
    default:
      return 0.1;
  }
};
