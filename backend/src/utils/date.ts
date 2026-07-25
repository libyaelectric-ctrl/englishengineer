/**
 * Date and time utility functions.
 */

/**
 * Returns ISO timestamp string.
 */
export const nowISO = (): string => new Date().toISOString();

/**
 * Returns timestamp in milliseconds.
 */
export const nowMs = (): number => Date.now();

/**
 * Adds days to a date and returns ISO string.
 */
export const addDays = (days: number, date = new Date()): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
};

/**
 * Adds hours to a date and returns ISO string.
 */
export const addHours = (hours: number, date = new Date()): string => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result.toISOString();
};

/**
 * Adds minutes to a date and returns ISO string.
 */
export const addMinutes = (minutes: number, date = new Date()): string => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result.toISOString();
};

/**
 * Returns the start of today (midnight) as ISO string.
 */
export const startOfToday = (): string => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
};

/**
 * Returns the end of today (23:59:59) as ISO string.
 */
export const endOfToday = (): string => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.toISOString();
};

/**
 * Checks if a date string is older than N days.
 */
export const isOlderThan = (dateStr: string, days: number): boolean => {
  const date = new Date(dateStr);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return date < threshold;
};

/**
 * Returns time difference in human-readable format.
 */
export const timeAgo = (dateStr: string): string => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

/**
 * Returns a date range for the last N days.
 */
export const lastNDays = (
  days: number
): { start: string; end: string } => ({
  start: addDays(-days),
  end: nowISO(),
});

/**
 * Formats a date for display.
 */
export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a datetime for display.
 */
export const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
