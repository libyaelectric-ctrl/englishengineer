export const calculateStreak = (
  currentStreak: number,
  lastActivityDate: string | null,
  now: Date
): number => {
  if (!lastActivityDate) return 1;

  const last = new Date(lastActivityDate);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return currentStreak + 1;
  if (diffDays > 1) return 1;
  return currentStreak;
};
