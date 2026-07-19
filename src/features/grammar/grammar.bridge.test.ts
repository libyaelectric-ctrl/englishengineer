import { describe, expect, it } from 'vitest';
import { GrammarVocabularyBridge } from './grammar.bridge';
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
  definition: 'Past tense describes completed actions.',
  explanation: 'Use verb+ed for regular verbs.',
  structure: 'Subject + V2',
  coreStructure: 'S + V2',
  examplePattern: 'I worked yesterday.',
  languageFunction: 'Narrating past events',
  progressionFamily: 'tense',
  turkishExplanation: 'Geçmiş zaman',
  engineeringUseCase: 'Reporting completed work',
  examples: [{ english: 'I worked on the project.', turkish: 'Proje üzerinde çalıştım.' }],
  badExampleEnglish: 'I work yesterday.',
  badExampleTurkishExplanation: 'Yanlış zaman kullanımı',
  correctedExampleEnglish: 'I worked yesterday.',
  mistakeType: 'tense',
  commonMistakes: 'Using present tense for past events',
  skillUse: ['reading', 'writing'],
  linkedVocabularyTags: ['project', 'report'],
  grammarFits: ['tense'],
  difficulty: 3,
  prerequisites: [],
  canGenerateTaskTypes: ['fill_blank', 'correction'],
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

describe('GrammarVocabularyBridge', () => {
  describe('extractVocabularyFromRule', () => {
    it('extracts linked vocabulary tags', () => {
      const rule = makeRule({ linkedVocabularyTags: ['project', 'report'] });
      const tags = GrammarVocabularyBridge.extractVocabularyFromRule(rule);
      expect(tags).toContain('project');
      expect(tags).toContain('report');
    });

    it('extracts words from examples', () => {
      const rule = makeRule({
        examples: [{ english: 'The engineer reviewed the document.', turkish: '' }],
      });
      const tags = GrammarVocabularyBridge.extractVocabularyFromRule(rule);
      expect(tags.some((t) => t.includes('engineer'))).toBe(true);
    });
  });

  describe('getGrammarRulesForVocabulary', () => {
    it('finds rules linked to vocabulary', () => {
      const rules = [
        makeRule({ id: 'r1', linkedVocabularyTags: ['project'] }),
        makeRule({ id: 'r2', linkedVocabularyTags: ['report'] }),
      ];
      const found = GrammarVocabularyBridge.getGrammarRulesForVocabulary(['project'], rules);
      expect(found).toHaveLength(1);
      expect(found[0].id).toBe('r1');
    });
  });

  describe('getVocabularyForGrammarRule', () => {
    it('finds vocabulary linked to rule', () => {
      const rule = makeRule({ linkedVocabularyTags: ['project', 'report'] });
      const vocabulary = [
        { id: 'v1', term: 'project', tags: ['project', 'engineering'] },
        { id: 'v2', term: 'house', tags: ['building'] },
      ];
      const found = GrammarVocabularyBridge.getVocabularyForGrammarRule(rule, vocabulary);
      expect(found).toHaveLength(1);
      expect(found[0].term).toBe('project');
    });
  });
});
