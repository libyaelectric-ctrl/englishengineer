export interface WeaknessEvaluation {
  weaknesses: string[];
  feedback?: string;
}

/**
 * Applies backend/AI-derived feedback notes to an evaluation object by
 * folding up to three non-empty notes into `weaknesses` (deduped) and
 * concatenating them into `feedback`.
 *
 * Returns `false` when there is nothing to apply so callers can short-circuit.
 */
export const applyFeedbackToEvaluation = (
  evaluation: WeaknessEvaluation,
  feedback: Record<string, string> | undefined
): boolean => {
  if (!feedback) return false;
  const notes = Object.values(feedback).filter(Boolean);
  if (notes.length === 0) return false;

  evaluation.weaknesses = [...new Set([...evaluation.weaknesses, ...notes.slice(0, 3)])];
  evaluation.feedback = notes.join(' ');
  return true;
};