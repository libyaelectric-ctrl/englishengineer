import { describe, expect, it } from 'vitest';

import { evaluatePlacement } from './placement.helpers';
import type { PlacementAnswers, PlacementQuestion } from './placement.types';

const mockQuestions: PlacementQuestion[] = [
  {
    id: 'q1',
    domain: 'reading',
    prompt: 'What is the capital of France?',
    choices: ['Paris', 'London', 'Berlin', 'Madrid'],
    correctIndex: 0,
    band: 'A1',
  },
  {
    id: 'q2',
    domain: 'vocabulary',
    prompt: 'Choose the correct synonym for "large".',
    choices: ['Big', 'Small', 'Tiny', 'Short'],
    correctIndex: 0,
    band: 'A1',
  },
  {
    id: 'q3',
    domain: 'grammar',
    prompt: 'She ___ to school every day.',
    choices: ['go', 'goes', 'going', 'gone'],
    correctIndex: 1,
    band: 'A2',
  },
  {
    id: 'q4',
    domain: 'reading',
    prompt: 'Identify the noun in: "The engineer checked the report."',
    choices: ['checked', 'engineer', 'The', 'report'],
    correctIndex: 1,
    band: 'A2',
  },
  {
    id: 'q5',
    domain: 'vocabulary',
    prompt: 'What does "commissioning" mean?',
    choices: ['Starting up equipment', 'Painting a wall', 'Buying materials', 'Writing a report'],
    correctIndex: 0,
    band: 'B1',
  },
  {
    id: 'q6',
    domain: 'grammar',
    prompt: 'If it rains, we ___ the meeting.',
    choices: ['cancel', 'will cancel', 'cancelling', 'cancelled'],
    correctIndex: 1,
    band: 'B1',
  },
  {
    id: 'q7',
    domain: 'reading',
    prompt: 'Passage: "The contractor submitted the RFI on time." What is an RFI?',
    choices: [
      'Request for Information',
      'Ready For Inspection',
      'Received From Installer',
      'Required For Issue',
    ],
    correctIndex: 0,
    band: 'B2',
  },
  {
    id: 'q8',
    domain: 'vocabulary',
    prompt: '"Submittal" in construction means:',
    choices: [
      'Formal document submission for approval',
      'Falling down',
      'Submitting a complaint',
      'Going to sleep',
    ],
    correctIndex: 0,
    band: 'B2',
  },
  {
    id: 'q9',
    domain: 'grammar',
    prompt: 'The report, which was completed yesterday, ___ reviewed.',
    choices: ['has been', 'have been', 'is being', 'were'],
    correctIndex: 0,
    band: 'C1',
  },
  {
    id: 'q10',
    domain: 'reading',
    prompt: '"Force majeure" clauses in FIDIC contracts refer to:',
    choices: [
      'Unforeseeable events beyond control',
      'Force used on site',
      'Mandatory overtime',
      'Maximum force limits',
    ],
    correctIndex: 0,
    band: 'C1',
  },
];

describe('evaluatePlacement', () => {
  it('returns empty result when no questions answered', () => {
    const result = evaluatePlacement(mockQuestions, {});
    expect(result.score).toBe(0);
    expect(result.answeredCount).toBe(0);
    expect(result.confidence).toBe('limited');
  });

  it('calculates correct score percentage', () => {
    const answers: PlacementAnswers = {
      q1: 0, // correct
      q2: 0, // correct
      q3: 1, // correct
      q4: 1, // correct
      q5: 0, // correct
      q6: 1, // correct
      q7: 0, // correct
      q8: 0, // correct
      q9: 0, // correct
      q10: 0, // correct
    };
    const result = evaluatePlacement(mockQuestions, answers);
    expect(result.score).toBe(100);
    expect(result.answeredCount).toBe(10);
    expect(result.confidence).toBe('strong');
  });

  it('calculates partial score correctly', () => {
    const answers: PlacementAnswers = {
      q1: 0, // correct
      q2: 1, // wrong (should be 0)
      q3: 1, // correct
      q4: 0, // wrong (should be 1)
    };
    const result = evaluatePlacement(mockQuestions, answers);
    expect(result.score).toBe(20); // 2/10 = 20% (score uses total questions, not answered)
    expect(result.answeredCount).toBe(4);
    expect(result.confidence).toBe('limited');
  });

  it('handles partial answers (not all questions answered)', () => {
    const answers: PlacementAnswers = {
      q1: 0, // correct
      q2: 0, // correct
      q3: 1, // correct
    };
    const result = evaluatePlacement(mockQuestions, answers);
    expect(result.score).toBe(30); // 3/10 = 30% (score uses total questions)
    expect(result.answeredCount).toBe(3);
    expect(result.confidence).toBe('limited');
  });

  it('identifies strengths (domains with >= 67% correct)', () => {
    // Answer all reading questions correctly (3/3 = 100%)
    // Answer vocabulary poorly (0/3 = 0%)
    const answers: PlacementAnswers = {
      q1: 0, // reading correct
      q4: 1, // reading correct
      q7: 0, // reading correct
      q10: 0, // reading correct
      q2: 1, // vocabulary wrong
      q5: 1, // vocabulary wrong
      q8: 1, // vocabulary wrong
    };
    const result = evaluatePlacement(mockQuestions, answers);
    expect(result.strengths).toContain('reading');
    expect(result.priorityAreas).toContain('vocabulary');
  });

  it('determines confidence levels correctly', () => {
    // Limited: < 6 answered
    const answers1: PlacementAnswers = { q1: 0, q2: 0, q3: 1 };
    expect(evaluatePlacement(mockQuestions, answers1).confidence).toBe('limited');

    // Moderate: 6-9 answered
    const answers2: PlacementAnswers = {
      q1: 0,
      q2: 0,
      q3: 1,
      q4: 1,
      q5: 0,
      q6: 1,
    };
    expect(evaluatePlacement(mockQuestions, answers2).confidence).toBe('moderate');

    // Strong: all 10 answered
    const answers3: PlacementAnswers = {
      q1: 0,
      q2: 0,
      q3: 1,
      q4: 1,
      q5: 0,
      q6: 1,
      q7: 0,
      q8: 0,
      q9: 0,
      q10: 0,
    };
    expect(evaluatePlacement(mockQuestions, answers3).confidence).toBe('strong');
  });

  it('returns completedAt as ISO string', () => {
    const now = new Date('2026-08-19T12:00:00Z');
    const result = evaluatePlacement(mockQuestions, {}, now);
    expect(result.completedAt).toBe('2026-08-19T12:00:00.000Z');
  });

  it('returns recommended skills', () => {
    const result = evaluatePlacement(mockQuestions, {});
    expect(result.recommendedSkills).toEqual(['reading', 'vocabulary', 'grammar']);
  });

  it('handles empty questions array', () => {
    const result = evaluatePlacement([], {});
    expect(result.score).toBe(0);
    expect(result.answeredCount).toBe(0);
    expect(result.recommendedBand).toBe('A1');
  });
});
