export type WritingStatus = 'draft' | 'submitted' | 'graded';

export interface WritingSubmission {
  id: string;
  promptId: string;
  content: string;
  score: number;
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  structureScore: number;
  status: WritingStatus;
  submittedAt: string | null;
}

const WORD_TARGETS: Record<string, number> = {
  A1: 100, A2: 150, B1: 200, B2: 250, C1: 300, C2: 350,
};

export const WritingProgressService = {
  getWordTarget(level: string): number {
    return WORD_TARGETS[level] ?? 200;
  },

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  },

  formatFeedback(feedback: Record<string, unknown>): string {
    return JSON.stringify(feedback, null, 2);
  },
};
