import type {
  ReadingEvaluationResult,
  ReadingMission,
} from '@/features/reading';
import type {
  WritingEvaluationResult,
  WritingMission,
} from '@/features/writing';
import { includesNormalized } from '@/features/learning-data';
import { GrammarProgressService } from './grammar.progress';
import { GrammarRepository } from './grammar.repository';
import type { GrammarRule } from './grammar.types';

const TRANSFER_SCORE_THRESHOLD = 80;
const MAX_EVIDENCE_RULES_PER_MISSION = 8;

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getTokens = (value: string): string[] =>
  normalize(value)
    .split(' ')
    .filter((token) => token.length >= 3);

const phraseMatches = (haystack: string, needle: string): boolean => {
  const normalizedNeedle = normalize(needle);
  return (
    normalizedNeedle.length >= 4 &&
    (haystack.includes(normalizedNeedle) || normalizedNeedle.includes(haystack))
  );
};

const getRuleSignals = (rule: GrammarRule): string[] =>
  [
    rule.title,
    rule.ruleTitle,
    rule.grammarCategory,
    rule.ruleType,
    rule.languageFunction,
    rule.progressionFamily,
    rule.structure,
    rule.coreStructure,
    ...rule.grammarFits,
  ].filter(Boolean);

const scoreRuleMatch = (
  rule: GrammarRule,
  textParts: string[],
  focusTerms: string[] = []
): number => {
  const corpus = normalize(textParts.join(' '));
  const focusCorpus = normalize(focusTerms.join(' '));
  const signals = getRuleSignals(rule);
  let score = 0;

  signals.forEach((signal) => {
    if (phraseMatches(corpus, signal)) score += 3;
    if (focusCorpus && phraseMatches(focusCorpus, signal)) score += 8;
  });

  const signalTokens = new Set(getTokens(signals.join(' ')));
  const corpusTokens = new Set(getTokens(corpus));
  const focusTokens = new Set(getTokens(focusCorpus));

  signalTokens.forEach((token) => {
    if (corpusTokens.has(token)) score += 1;
    if (focusTokens.has(token)) score += 3;
  });

  return score;
};

const findTransferRules = async (
  skill: 'reading' | 'writing',
  level: GrammarRule['cefrLevel'],
  taskType: string,
  textParts: string[],
  focusTerms: string[] = []
): Promise<GrammarRule[]> => {
  const candidates = (
    await GrammarRepository.getGrammarRulesForUserSkillLevel(skill, level)
  ).filter((rule) => includesNormalized(rule.canGenerateTaskTypes, taskType));

  return candidates
    .map((rule) => ({
      rule,
      score: scoreRuleMatch(rule, textParts, focusTerms),
    }))
    .filter(({ score }) => score >= (focusTerms.length > 0 ? 6 : 5))
    .sort((a, b) => b.score - a.score || a.rule.difficulty - b.rule.difficulty)
    .slice(0, MAX_EVIDENCE_RULES_PER_MISSION)
    .map(({ rule }) => rule);
};

const recordTransferEvidence = (
  rules: GrammarRule[],
  skill: 'reading' | 'writing',
  missionId: string,
  score: number
): string[] => {
  rules.forEach((rule) => {
    GrammarProgressService.recordSkillEvidence(
      rule.id,
      skill,
      missionId,
      score
    );
  });
  return rules.map((rule) => rule.id);
};

export const GrammarTransferService = {
  async recordReadingEvidence(
    mission: ReadingMission,
    evaluation: ReadingEvaluationResult
  ): Promise<string[]> {
    if (evaluation.finalScore < TRANSFER_SCORE_THRESHOLD) return [];
    const rules = await findTransferRules(
      'reading',
      mission.cefrLevel,
      'reading-comprehension',
      [
        mission.title,
        mission.description,
        mission.passageText,
        ...mission.questions.flatMap((question) => [
          question.questionText,
          question.explanation,
        ]),
      ]
    );
    return recordTransferEvidence(
      rules,
      'reading',
      mission.id,
      evaluation.finalScore
    );
  },

  async recordWritingEvidence(
    mission: WritingMission,
    evaluation: WritingEvaluationResult
  ): Promise<string[]> {
    const grammarCorrections = evaluation.detailedCorrections.filter(
      (correction) => correction.type === 'grammar'
    );
    const grammarWasControlled =
      grammarCorrections.length === 0 ||
      grammarCorrections.every((correction) => correction.isFixed);

    if (
      evaluation.finalScore < TRANSFER_SCORE_THRESHOLD ||
      !grammarWasControlled
    ) {
      return [];
    }

    const rules = await findTransferRules(
      'writing',
      mission.cefrLevel,
      'writing-correction',
      [
        mission.title,
        mission.description,
        mission.initialDraft,
        mission.sampleExcellentAnswer ?? '',
        ...(mission.expectedStructure ?? []),
      ],
      mission.grammarFocus ?? []
    );
    return recordTransferEvidence(
      rules,
      'writing',
      mission.id,
      evaluation.finalScore
    );
  },
};
