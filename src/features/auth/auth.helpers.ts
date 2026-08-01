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
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return 'user_' + Array.from(array)
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 12);
}
