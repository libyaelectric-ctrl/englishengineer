const startOfDay = (d: Date): Date => {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const calculateStreak = (
  currentStreak: number,
  lastActivityDate: string | null,
  now: Date
): number => {
  if (!lastActivityDate) return 1;

  const last = startOfDay(new Date(lastActivityDate));
  const today = startOfDay(now);
  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return currentStreak + 1;
  if (diffDays > 1) return 1;
  return currentStreak;
};
