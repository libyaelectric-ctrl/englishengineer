/**
 * Calculates Levenshtein similarity between two strings.
 * Returns a value between 0 (completely different) and 1 (identical).
 */
export function levenshteinSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1;

  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - matrix[s1.length][s2.length] / maxLen;
}

/**
 * Formats a duration in seconds to "mm:ss" string.
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Returns Tailwind badge styling for CEFR levels.
 */
export function getCefrBadgeStyles(level: string): string {
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
}
