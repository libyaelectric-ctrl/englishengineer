// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CEFR_LEVELS, type CefrLevel } from '@/shared/types/domain.types';
import type { GrammarRule } from '@/shared/types/grammar.types';

import { GrammarEngine } from './grammar.engine';
import { GrammarRepository } from './grammar.repository';

/* ------------------------------------------------------------------ */
/*  Synthetic fixture generator                                        */
/*  Produces minimal GrammarRule objects that satisfy the type and     */
/*  are distinguishable by level / id so filtering can be validated.   */
/* ------------------------------------------------------------------ */

const LEVEL_COUNTS: Record<CefrLevel, number> = {
  A1: 6, A2: 6, B1: 6, B2: 6, C1: 6, C2: 6,
};

const LEVEL_INDEX: Record<CefrLevel, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };

let fixtureId = 0;
const makeRule = (level: CefrLevel, idx: number): GrammarRule => ({
  id: `grammar_${level.toLowerCase()}_${idx}`,
  title: `Rule ${level}-${idx}`,
  cefrLevel: level,
  ruleCefrLevel: level,
  grammarCategory: 'syntax',
  ruleType: 'pattern',
  importTier: 'core',
  ruleTitle: `Rule ${level}-${idx}`,
  definition: `Definition for ${level} rule ${idx}`,
  explanation: `Explanation for ${level} rule ${idx}`,
  structure: 'S + V + O',
  coreStructure: 'S + V + O',
  examplePattern: 'I eat apples.',
  languageFunction: 'description',
  progressionFamily: `family_${level.toLowerCase()}`,
  turkishExplanation: `${level} kural ${idx}`,
  engineeringUseCase: 'technical writing',
  examples: [{ english: 'I eat apples.', turkish: 'Elma yerim.' }],
  badExampleEnglish: 'I eat apple.',
  badExampleTurkishExplanation: ' çoğul eksik',
  correctedExampleEnglish: 'I eat apples.',
  mistakeType: 'plural',
  commonMistakes: 'missing plural',
  skillUse: ['speaking', 'reading', 'writing', 'listening'],
  linkedVocabularyTags: [],
  grammarFits: [],
  difficulty: LEVEL_INDEX[level] + 1,
  prerequisites: [],
  canGenerateTaskTypes: ['speaking-production', 'fill-in', 'translation'],
  domainFit: ['general', 'engineering'],
  taskPromptTemplate: 'Complete the sentence',
  minimumUserOutput: '1 word',
  masteryCriteria: '3 correct in a row',
  exampleCefrLevel: level,
  status: 'approved',
  confidence: 0.9,
  cefrConfidence: 0.85,
  exampleQualityScore: 0.8,
  engineeringRelevanceScore: 0.7,
  taskGenerationScore: 0.75,
});

const buildFixtures = (): Record<string, GrammarRule[]> => {
  const result: Record<string, GrammarRule[]> = {};
  for (const level of CEFR_LEVELS) {
    const count = LEVEL_COUNTS[level];
    result[level] = Array.from({ length: count }, (_, i) => makeRule(level, i));
  }
  return result;
};

const FIXTURES = buildFixtures();

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */

describe('grammar database integration', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Clear the GrammarRepository internal cache between tests
    GrammarRepository.clearCache();

    // Mock global fetch to serve synthetic fixture data
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      // Match /data/grammar/{level}.seed.json
      const match = url.match(/\/data\/grammar\/([a-c][12])\.seed\.json$/);
      if (match) {
        const level = match[1].toUpperCase() as CefrLevel;
        const data = FIXTURES[level];
        if (data) {
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      return new Response('Not found', { status: 404 });
    }) as typeof globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    GrammarRepository.clearCache();
  });

  it('loads grammar rules across every CEFR level', async () => {
    const levels = await Promise.all(
      CEFR_LEVELS.map((level) => GrammarRepository.getGrammarRulesByLevel(level))
    );
    const rules = levels.flat();
    const expectedTotal = CEFR_LEVELS.reduce((sum, l) => sum + LEVEL_COUNTS[l], 0);
    expect(rules).toHaveLength(expectedTotal);
    expect(new Set(rules.map((rule) => rule.id)).size).toBe(expectedTotal);
    expect(levels.map((r) => r.length)).toEqual(CEFR_LEVELS.map((l) => LEVEL_COUNTS[l]));
  });

  it('filters repository records by exact CEFR level', async () => {
    const rules = await GrammarRepository.getGrammarRulesByLevel('A1');
    expect(rules.length).toBe(LEVEL_COUNTS.A1);
    expect(rules.every((rule) => rule.cefrLevel === 'A1')).toBe(true);
  });

  it('keeps A1 speaking selections at A1', async () => {
    const rules = await GrammarEngine.selectGrammarForTask('speaking', 'A1', 'speaking-production');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every((rule) => rule.cefrLevel === 'A1')).toBe(true);
  });

  it('uses the requested skill level from an independent profile', async () => {
    const rules = await GrammarEngine.selectGrammarForUserProfile(
      { reading: 'C1', speaking: 'A1' },
      'speaking',
      'speaking-production'
    );
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((rule) => ['C1', 'C2'].includes(rule.cefrLevel))).toBe(false);
  });
});
