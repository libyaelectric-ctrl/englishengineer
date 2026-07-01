export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '??';
  if (parts.length === 1) {
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 11);
}
