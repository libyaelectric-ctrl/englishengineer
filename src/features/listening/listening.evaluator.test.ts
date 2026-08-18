import { describe, expect, it, vi } from 'vitest';

import { ListeningEvaluator } from './listening.evaluator';
import { ListeningMission, ListeningSubmission } from './listening.types';

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

const createMission = (overrides: Partial<ListeningMission> = {}): ListeningMission => ({
  id: 'test-mission',
  title: 'Test Mission',
  description: 'Test description',
  missionType: 'Office Meeting',
  discipline: 'civil',
  cefrLevel: 'B1',
  difficulty: 'beginner',
  estimatedMinutes: 10,
  audioUrl: 'https://example.com/audio.mp3',
  audioDurationSeconds: 120,
  accentLabel: 'American',
  audioSourceLabel: 'Test',
  transcript: 'This is a test transcript about engineering.',
  hiddenTranscript: 'This is a test _____ about engineering.',
  keywords: ['engineering', 'construction', 'safety'],
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
      explanation: 'The audio discusses construction.',
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
      type: 'technical_fill_in',
      questionText: 'Complete: The ____ was poured.',
      correctAnswer: 'concrete',
      explanation: 'Concrete is poured.',
    },
  ],
  xpReward: 100,
  coinReward: 20,
  eloReward: 10,
  ...overrides,
});

const createSubmission = (overrides: Partial<ListeningSubmission> = {}): ListeningSubmission => ({
  missionId: 'test-mission',
  answers: { q1: 'A', q2: 'true', q3: 'concrete' },
  summary: 'The audio discusses construction methods and safety protocols.',
  userKeywords: 'engineering construction safety',
  timeSpentMinutes: 5,
  ...overrides,
});

describe('ListeningEvaluator', () => {
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
      const submission = createSubmission({
        answers: { q1: 'B' },
        summary: 'Basic math question.',
        userKeywords: 'math',
      });
      const result = ListeningEvaluator.evaluate(mission, submission);

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
      const submission = createSubmission({
        answers: { q1: 'true' },
        summary: 'The sky is blue.',
        userKeywords: 'sky blue',
      });
      const result = ListeningEvaluator.evaluate(mission, submission);

      expect(result.comprehensionScore).toBe(100);
      expect(result.detailedAnswers[0].isCorrect).toBe(true);
    });

    it('evaluates technical fill_in correctly', () => {
      const mission = createMission({
        questions: [
          {
            id: 'q1',
            type: 'technical_fill_in',
            questionText: 'Complete: The ____ was poured.',
            correctAnswer: 'concrete',
            explanation: 'Concrete is poured.',
          },
        ],
      });
      const submission = createSubmission({
        answers: { q1: 'concrete' },
        summary: 'Concrete pouring.',
        userKeywords: 'concrete',
      });
      const result = ListeningEvaluator.evaluate(mission, submission);

      expect(result.comprehensionScore).toBe(100);
      expect(result.detailedAnswers[0].isCorrect).toBe(true);
    });

    it('calculates keyword score', () => {
      const mission = createMission({
        keywords: ['engineering', 'construction', 'safety'],
      });
      const submission = createSubmission({
        summary: 'Engineering construction safety protocols.',
        userKeywords: 'engineering construction safety',
      });
      const result = ListeningEvaluator.evaluate(mission, submission);

      expect(result.keywordScore).toBeGreaterThan(0);
    });

    it('calculates vocabulary score', () => {
      const mission = createMission({
        vocabulary: [
          { term: 'concrete', definition: 'Building material', context: 'Used in foundations' },
        ],
      });
      const submission = createSubmission({
        summary: 'Concrete is used in construction.',
        userKeywords: 'concrete',
      });
      const result = ListeningEvaluator.evaluate(mission, submission);

      expect(result.vocabularyScore).toBeGreaterThan(0);
    });

    it('calculates summary score based on word count', () => {
      const mission = createMission();
      const submission = createSubmission({
        summary: 'This is a detailed summary with more than thirty words to test the summary scoring function. It should include technical terms and provide a comprehensive overview of the engineering topic discussed in the audio.',
        userKeywords: 'engineering construction',
      });
      const result = ListeningEvaluator.evaluate(mission, submission);

      expect(result.summaryScore).toBeGreaterThan(0);
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
      const submission = createSubmission({
        answers: {},
        summary: '',
        userKeywords: '',
      });
      const result = ListeningEvaluator.evaluate(mission, submission);

      expect(result.comprehensionScore).toBe(0);
      expect(result.detailedAnswers[0].isCorrect).toBe(false);
      expect(result.detailedAnswers[0].userAnswer).toBe('(No Answer Provided)');
    });

    it('calculates final score as weighted average', () => {
      const mission = createMission();
      const submission = createSubmission();
      const result = ListeningEvaluator.evaluate(mission, submission);

      // finalScore = comprehension*0.4 + keyword*0.2 + vocab*0.2 + summary*0.2
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.finalScore).toBeLessThanOrEqual(100);
    });

    it('includes scoring results (xp, coins, elo)', () => {
      const mission = createMission();
      const submission = createSubmission();
      const result = ListeningEvaluator.evaluate(mission, submission);

      expect(result.xpEarned).toBeDefined();
      expect(result.coinsEarned).toBeDefined();
      expect(result.eloChange).toBeDefined();
    });

    it('generates strengths and weaknesses', () => {
      const mission = createMission();
      const submission = createSubmission();
      const result = ListeningEvaluator.evaluate(mission, submission);

      expect(result.strengths).toBeInstanceOf(Array);
      expect(result.weaknesses).toBeInstanceOf(Array);
      expect(result.strengths.length + result.weaknesses.length).toBeGreaterThan(0);
    });

    it('provides summary and keyword feedback', () => {
      const mission = createMission();
      const submission = createSubmission();
      const result = ListeningEvaluator.evaluate(mission, submission);

      expect(result.summaryFeedback).toBeDefined();
      expect(typeof result.summaryFeedback).toBe('string');
      expect(result.keywordFeedback).toBeDefined();
      expect(typeof result.keywordFeedback).toBe('string');
    });
  });
});
