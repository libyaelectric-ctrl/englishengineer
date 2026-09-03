export const SLEEP_AFTER_MS = 30_000;

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

export const MascotStateColors: Record<string, string> = {
  idle: '#6366f1',
  thinking: '#f59e0b',
  celebrate: '#22c55e',
  levelUp: '#8b5cf6',
  streak: '#ef4444',
  sleeping: '#94a3b8',
  concerned: '#f97316',
  streakDanger: '#ef4444',
  empty: '#64748b',
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
