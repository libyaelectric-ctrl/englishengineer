import type { GrammarRule } from './grammar.types';

export type DrillType = 'fill_blank' | 'correction' | 'multiple_choice' | 'reordering' | 'transformation';

export interface DrillQuestion {
  id: string;
  type: DrillType;
  ruleId: string;
  instruction: string;
  sentence: string;
  options?: string[];
  correctAnswer: string;
  hints: string[];
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface DrillResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentMs: number;
  xpEarned: number;
}

const DRILL_GENERATORS: Record<DrillType, (rule: GrammarRule) => DrillQuestion[]> = {
  fill_blank: (rule) => {
    const questions: DrillQuestion[] = [];
    rule.examples.forEach((ex, i) => {
      const words = ex.english.split(' ');
      const blankIndex = Math.min(Math.floor(words.length / 2), words.length - 1);
      const correct = words[blankIndex];
      words[blankIndex] = '______';
      questions.push({
        id: `${rule.id}_fill_${i}`,
        type: 'fill_blank',
        ruleId: rule.id,
        instruction: 'Fill in the blank with the correct word.',
        sentence: words.join(' '),
        correctAnswer: correct,
        hints: [correct[0], `${correct.length} letters`],
        explanation: rule.explanation,
        difficulty: 'beginner',
      });
    });
    return questions;
  },

  correction: (rule) => [
    {
      id: `${rule.id}_correct_0`,
      type: 'correction',
      ruleId: rule.id,
      instruction: 'Find and correct the grammar mistake.',
      sentence: rule.badExampleEnglish,
      correctAnswer: rule.correctedExampleEnglish,
      hints: [rule.mistakeType],
      explanation: rule.badExampleTurkishExplanation,
      difficulty: 'intermediate',
    },
  ],

  multiple_choice: (rule) => {
    const questions: DrillQuestion[] = [];
    rule.examples.forEach((ex, i) => {
      const words = ex.english.split(' ');
      const target = words[Math.min(Math.floor(words.length / 2), words.length - 1)];
      const wrongOptions = ['is', 'are', 'was', 'were', 'have', 'has', 'will', 'can']
        .filter((w) => w !== target)
        .slice(0, 3);
      const options = [target, ...wrongOptions].sort(() => Math.random() - 0.5);

      questions.push({
        id: `${rule.id}_mc_${i}`,
        type: 'multiple_choice',
        ruleId: rule.id,
        instruction: 'Choose the correct option.',
        sentence: ex.english.replace(target, '______'),
        options,
        correctAnswer: target,
        hints: [],
        explanation: rule.explanation,
        difficulty: 'beginner',
      });
    });
    return questions;
  },

  reordering: (rule) => {
    const questions: DrillQuestion[] = [];
    rule.examples.forEach((ex, i) => {
      const words = ex.english.split(' ').filter((w) => w.length > 0);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      questions.push({
        id: `${rule.id}_reorder_${i}`,
        type: 'reordering',
        ruleId: rule.id,
        instruction: 'Arrange the words in the correct order.',
        sentence: shuffled.join(' '),
        correctAnswer: ex.english,
        hints: [`${words.length} words`],
        explanation: rule.structure,
        difficulty: 'intermediate',
      });
    });
    return questions;
  },

  transformation: (rule) => [
    {
      id: `${rule.id}_transform_0`,
      type: 'transformation',
      ruleId: rule.id,
      instruction: 'Transform the sentence according to the rule.',
      sentence: rule.examples[0]?.english ?? '',
      correctAnswer: rule.correctedExampleEnglish,
      hints: [rule.ruleTitle],
      explanation: rule.turkishExplanation,
      difficulty: 'advanced',
    },
  ],
};

export const InteractiveDrillService = {
  generateDrills(
    rule: GrammarRule,
    types: DrillType[] = ['fill_blank', 'multiple_choice', 'correction']
  ): DrillQuestion[] {
    return types.flatMap((type) => DRILL_GENERATORS[type]?.(rule) ?? []);
  },

  generateMixedDrills(
    rules: GrammarRule[],
    count = 10
  ): DrillQuestion[] {
    const allDrills = rules.flatMap((rule) =>
      this.generateDrills(rule, ['fill_blank', 'multiple_choice', 'correction'])
    );
    return allDrills.sort(() => Math.random() - 0.5).slice(0, count);
  },

  checkAnswer(question: DrillQuestion, userAnswer: string): boolean {
    const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    return normalize(userAnswer) === normalize(question.correctAnswer);
  },

  calculateXP(question: DrillQuestion, isCorrect: boolean, timeSpentMs: number): number {
    if (!isCorrect) return 0;
    const baseXP = { beginner: 5, intermediate: 10, advanced: 20 }[question.difficulty];
    const speedBonus = timeSpentMs < 5000 ? 5 : timeSpentMs < 10000 ? 2 : 0;
    return baseXP + speedBonus;
  },

  getDrillTypeLabel(type: DrillType): string {
    const labels: Record<DrillType, string> = {
      fill_blank: 'Fill in the Blank',
      correction: 'Error Correction',
      multiple_choice: 'Multiple Choice',
      reordering: 'Word Reordering',
      transformation: 'Sentence Transformation',
    };
    return labels[type];
  },
};
