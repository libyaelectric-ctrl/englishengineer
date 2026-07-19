import { describe, expect, it } from 'vitest';
import { InteractiveDrillService, type DrillQuestion } from './grammar.drills';
import type { GrammarRule } from './grammar.types';

const makeRule = (overrides: Partial<GrammarRule> = {}): GrammarRule => ({
  id: 'rule-1',
  title: 'Past Tense',
  cefrLevel: 'A1',
  ruleCefrLevel: 'A1',
  grammarCategory: 'tense',
  ruleType: 'formation',
  importTier: 'core',
  ruleTitle: 'Simple Past',
  definition: 'Past tense.',
  explanation: 'Use verb+ed.',
  structure: 'S + V2',
  coreStructure: 'S + V2',
  examplePattern: 'I worked.',
  languageFunction: 'Narrating',
  progressionFamily: 'tense',
  turkishExplanation: 'Geçmiş zaman',
  engineeringUseCase: 'Reporting',
  examples: [
    { english: 'I worked on the project.', turkish: 'Proje üzerinde çalıştım.' },
    { english: 'She reviewed the document.', turkish: 'Belgeyi gözden geçirdi.' },
  ],
  badExampleEnglish: 'I work yesterday.',
  badExampleTurkishExplanation: 'Yanlış zaman',
  correctedExampleEnglish: 'I worked yesterday.',
  mistakeType: 'tense',
  commonMistakes: 'Wrong tense',
  skillUse: ['reading', 'writing'],
  linkedVocabularyTags: ['project'],
  grammarFits: ['tense'],
  difficulty: 3,
  prerequisites: [],
  canGenerateTaskTypes: ['fill_blank'],
  domainFit: ['engineering'],
  taskPromptTemplate: '',
  minimumUserOutput: '',
  masteryCriteria: '',
  exampleCefrLevel: 'A1',
  status: 'approved',
  confidence: 0.9,
  cefrConfidence: 0.9,
  exampleQualityScore: 0.8,
  engineeringRelevanceScore: 0.7,
  taskGenerationScore: 0.8,
  importReadinessScore: 0.9,
  notes: '',
  ...overrides,
});

describe('InteractiveDrillService', () => {
  describe('generateDrills', () => {
    it('generates fill_blank questions', () => {
      const rule = makeRule();
      const drills = InteractiveDrillService.generateDrills(rule, ['fill_blank']);
      expect(drills.length).toBeGreaterThan(0);
      expect(drills[0].type).toBe('fill_blank');
    });

    it('generates multiple_choice questions', () => {
      const rule = makeRule();
      const drills = InteractiveDrillService.generateDrills(rule, ['multiple_choice']);
      expect(drills.length).toBeGreaterThan(0);
      expect(drills[0].options).toBeDefined();
    });

    it('generates correction questions', () => {
      const rule = makeRule();
      const drills = InteractiveDrillService.generateDrills(rule, ['correction']);
      expect(drills.length).toBe(1);
      expect(drills[0].type).toBe('correction');
    });
  });

  describe('checkAnswer', () => {
    it('correct answer returns true', () => {
      const q: DrillQuestion = {
        id: 'q1', type: 'fill_blank', ruleId: 'r1', instruction: '',
        sentence: '', correctAnswer: 'worked', hints: [], explanation: '',
        difficulty: 'beginner',
      };
      expect(InteractiveDrillService.checkAnswer(q, 'worked')).toBe(true);
    });

    it('wrong answer returns false', () => {
      const q: DrillQuestion = {
        id: 'q1', type: 'fill_blank', ruleId: 'r1', instruction: '',
        sentence: '', correctAnswer: 'worked', hints: [], explanation: '',
        difficulty: 'beginner',
      };
      expect(InteractiveDrillService.checkAnswer(q, 'walked')).toBe(false);
    });

    it('case-insensitive', () => {
      const q: DrillQuestion = {
        id: 'q1', type: 'fill_blank', ruleId: 'r1', instruction: '',
        sentence: '', correctAnswer: 'Worked', hints: [], explanation: '',
        difficulty: 'beginner',
      };
      expect(InteractiveDrillService.checkAnswer(q, 'worked')).toBe(true);
    });
  });

  describe('calculateXP', () => {
    it('returns 0 for incorrect answer', () => {
      const q: DrillQuestion = {
        id: 'q1', type: 'fill_blank', ruleId: 'r1', instruction: '',
        sentence: '', correctAnswer: 'x', hints: [], explanation: '',
        difficulty: 'beginner',
      };
      expect(InteractiveDrillService.calculateXP(q, false, 5000)).toBe(0);
    });

    it('returns more XP for advanced questions', () => {
      const beginner: DrillQuestion = {
        id: 'q1', type: 'fill_blank', ruleId: 'r1', instruction: '',
        sentence: '', correctAnswer: 'x', hints: [], explanation: '',
        difficulty: 'beginner',
      };
      const advanced: DrillQuestion = {
        id: 'q2', type: 'fill_blank', ruleId: 'r1', instruction: '',
        sentence: '', correctAnswer: 'x', hints: [], explanation: '',
        difficulty: 'advanced',
      };
      expect(InteractiveDrillService.calculateXP(advanced, true, 5000))
        .toBeGreaterThan(InteractiveDrillService.calculateXP(beginner, true, 5000));
    });

    it('gives speed bonus', () => {
      const q: DrillQuestion = {
        id: 'q1', type: 'fill_blank', ruleId: 'r1', instruction: '',
        sentence: '', correctAnswer: 'x', hints: [], explanation: '',
        difficulty: 'beginner',
      };
      const fast = InteractiveDrillService.calculateXP(q, true, 3000);
      const slow = InteractiveDrillService.calculateXP(q, true, 15000);
      expect(fast).toBeGreaterThan(slow);
    });
  });

  describe('getDrillTypeLabel', () => {
    it('returns correct labels', () => {
      expect(InteractiveDrillService.getDrillTypeLabel('fill_blank')).toBe('Fill in the Blank');
      expect(InteractiveDrillService.getDrillTypeLabel('correction')).toBe('Error Correction');
    });
  });
});
