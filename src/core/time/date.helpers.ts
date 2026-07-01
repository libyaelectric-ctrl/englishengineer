import { Timestamp } from '../entities/entity.types';

/**
 * Formats a given ISO date or Timestamp string to a human-readable layout.
 */
export function formatDate(
  date: Timestamp | Date | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid Date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(parsedDate);
}

/**
 * Formats a given ISO date/Timestamp to a relative timing phrase (e.g., "3 minutes ago").
 */
export function formatRelativeTime(date: Timestamp | Date | number): string {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return 'unknown time';
  }

  const now = Date.now();
  const diffMs = parsedDate.getTime() - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, 'second');
  } else if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  } else {
    return rtf.format(diffDays, 'day');
  }
}
