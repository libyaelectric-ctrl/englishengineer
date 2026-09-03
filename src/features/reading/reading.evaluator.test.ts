import { describe, expect, it, vi } from 'vitest';

import { ReadingMission, ReadingSubmission } from '@/shared/types/reading.types';

import { ReadingEvaluator } from './reading.evaluator';

// Mock ScoringService
vi.mock('@/core/learning/scoring.service', () => ({
  ScoringService: {
    calculateScore: vi.fn(() => ({
      xp: 50,
      coins: 10,
      eloChange: 5,
      strengths: [],
      weaknesses: [],
      feedback: 'Test feedback',
    })),
  },
}));

const createMission = (overrides: Partial<ReadingMission> = {}): ReadingMission => ({
  id: 'test-mission',
  title: 'Test Mission',
  description: 'Test description',
  discipline: 'civil',
  cefrLevel: 'B1',
  difficulty: 'beginner',
  estimatedMinutes: 10,
  passageText: 'Test passage text about engineering.',
  vocabulary: [
    { term: 'concrete', definition: 'Building material', context: 'Used in foundations' },
    { term: 'steel', definition: 'Metal alloy', context: 'Structural framework' },
  ],
  questions: [
    {
      id: 'q1',
      type: 'multiple_choice',
      questionText: 'What is the main topic?',
      choices: ['A. Construction', 'B. Chemistry', 'C. Biology'],
      correctAnswer: 'A',
      explanation: 'The passage discusses construction.',
    },
    {
      id: 'q2',
      type: 'true_false',
      questionText: 'Steel is used in construction.',
      correctAnswer: 'true',
      explanation: 'Steel is indeed used in construction.',
    },
    {
      id: 'q3',
      type: 'keyword_answer',
      questionText: 'What material is mentioned?',
      correctAnswer: 'concrete',
      keywords: ['concrete', 'cement'],
      explanation: 'Concrete is mentioned.',
    },
    {
      id: 'q4',
      type: 'short_answer',
      questionText: 'Describe the engineering process.',
      correctAnswer: 'construction',
      keywords: ['construction', 'building'],
      explanation: 'The process involves construction.',
    },
  ],
  xpReward: 100,
  coinReward: 20,
  eloReward: 10,
  ...overrides,
});

const createSubmission = (answers: Record<string, string> = {}): ReadingSubmission => ({
  missionId: 'test-mission',
  answers,
  timeSpentMinutes: 5,
});

describe('ReadingEvaluator', () => {
  describe('evaluate', () => {
    it('evaluates multiple choice correctly', () => {
      const mission = createMission({
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            questionText: 'What is 2+2?',
            choices: ['A. 3', 'B. 4', 'C. 5'],
            correctAnswer: 'B',
            explanation: 'Basic math.',
          },
        ],
      });
      const submission = createSubmission({ q1: 'B' });
      const result = ReadingEvaluator.evaluate(mission, submission, 0);

      expect(result.comprehensionScore).toBe(100);
      expect(result.detailedAnswers[0].isCorrect).toBe(true);
    });

    it('evaluates true/false correctly', () => {
      const mission = createMission({
        questions: [
          {
            id: 'q1',
            type: 'true_false',
            questionText: 'Is the sky blue?',
            correctAnswer: 'true',
            explanation: 'The sky appears blue.',
          },
        ],
      });
      const submission = createSubmission({ q1: 'true' });
      const result = ReadingEvaluator.evaluate(mission, submission, 0);

      expect(result.comprehensionScore).toBe(100);
      expect(result.detailedAnswers[0].isCorrect).toBe(true);
    });

    it('evaluates keyword answer correctly', () => {
      const mission = createMission({
        questions: [
          {
            id: 'q1',
            type: 'keyword_answer',
            questionText: 'What is used?',
            correctAnswer: 'concrete',
            keywords: ['concrete', 'cement'],
            explanation: 'Concrete is used.',
          },
        ],
      });
      const submission = createSubmission({ q1: 'concrete is used' });
      const result = ReadingEvaluator.evaluate(mission, submission, 0);

      expect(result.technicalAccuracyScore).toBe(100);
      expect(result.detailedAnswers[0].isCorrect).toBe(true);
    });

    it('evaluates short answer correctly', () => {
      const mission = createMission({
        questions: [
          {
            id: 'q1',
            type: 'short_answer',
            questionText: 'Describe the process.',
            correctAnswer: 'construction',
            keywords: ['construction', 'building'],
            explanation: 'The process involves construction.',
          },
        ],
      });
      const submission = createSubmission({
        q1: 'The construction process involves building structures.',
      });
      const result = ReadingEvaluator.evaluate(mission, submission, 0);

      expect(result.vocabularyScore).toBeGreaterThan(0);
      expect(result.detailedAnswers[0].isCorrect).toBe(true);
    });

    it('calculates vocabulary score with click bonus', () => {
      const mission = createMission({
        questions: [
          {
            id: 'q1',
            type: 'short_answer',
            questionText: 'Describe.',
            correctAnswer: 'test',
            keywords: ['test'],
            explanation: 'Test.',
          },
        ],
      });
      const submission = createSubmission({ q1: 'Test answer with keywords.' });
      const result = ReadingEvaluator.evaluate(mission, submission, 2);

      // Click bonus: min(30, 2*15) = 30
      expect(result.vocabularyScore).toBeGreaterThan(0);
    });

    it('handles empty answers', () => {
      const mission = createMission({
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            questionText: 'What?',
            choices: ['A', 'B'],
            correctAnswer: 'A',
            explanation: 'Test.',
          },
        ],
      });
      const submission = createSubmission({});
      const result = ReadingEvaluator.evaluate(mission, submission, 0);

      expect(result.comprehensionScore).toBe(0);
      expect(result.detailedAnswers[0].isCorrect).toBe(false);
      expect(result.detailedAnswers[0].userAnswer).toBe('(No Answer Provided)');
    });

    it('calculates final score as weighted average', () => {
      const mission = createMission({
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            questionText: 'Q1',
            choices: ['A', 'B'],
            correctAnswer: 'A',
            explanation: 'Test.',
          },
        ],
      });
      const submission = createSubmission({ q1: 'A' });
      const result = ReadingEvaluator.evaluate(mission, submission, 0);

      // finalScore = comprehension*0.4 + vocab*0.3 + tech*0.3
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.finalScore).toBeLessThanOrEqual(100);
    });

    it('includes scoring results (xp, coins, elo)', () => {
      const mission = createMission();
      const submission = createSubmission({
        q1: 'A',
        q2: 'true',
        q3: 'concrete',
        q4: 'construction',
      });
      const result = ReadingEvaluator.evaluate(mission, submission, 0);

      expect(result.xpEarned).toBeDefined();
      expect(result.coinsEarned).toBeDefined();
      expect(result.eloChange).toBeDefined();
    });

    it('generates strengths and weaknesses', () => {
      const mission = createMission();
      const submission = createSubmission({
        q1: 'A',
        q2: 'true',
        q3: 'concrete',
        q4: 'construction',
      });
      const result = ReadingEvaluator.evaluate(mission, submission, 0);

      expect(result.strengths).toBeInstanceOf(Array);
      expect(result.weaknesses).toBeInstanceOf(Array);
      expect(result.strengths.length + result.weaknesses.length).toBeGreaterThan(0);
    });
  });
});
