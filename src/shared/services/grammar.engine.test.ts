import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserSkillProfile } from '@/core/learning';
import type { LearningDataSkill } from '@/core/learning';
import { useLearningStore } from '@/core/learning/learning.store';

import { GrammarProgressService } from '@/shared/services/grammar-progress.service';
import { GrammarEngine } from '@/shared/services/grammar.engine';
import { GrammarRepository } from '@/shared/services/grammar.repository';
import type { CefrLevel } from '@/shared/types/domain.types';
import type { GrammarRule } from '@/shared/types/grammar.types';

// Mock dependencies
vi.mock('@/core/learning/learning.store', () => ({
  useLearningStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/shared/services/grammar.repository', () => ({
  GrammarRepository: {
    getGrammarRulesByLevel: vi.fn(),
  },
}));

vi.mock('@/shared/services/grammar-progress.service', () => ({
  GrammarProgressService: {
    get: vi.fn(),
  },
}));

describe('GrammarEngine integration with UNIFIED_DIFFICULTY_SCORING', () => {
  const mockRule = (overrides: Partial<GrammarRule> = {}): GrammarRule => ({
    id: 'grammar-1',
    title: 'Present Simple',
    explanation: 'Used for habitual actions',
    turkishExplanation: 'Alışkanlık eylemleri için kullanılır',
    structure: 'subject + verb',
    cefrLevel: 'A1' as CefrLevel,
    difficulty: 1,
    prerequisites: [],
    canGenerateTaskTypes: ['fill-blank', 'multiple-choice'],
    domainFit: ['general'],
    skillUse: ['grammar'],
    grammarCategory: 'tense',
    grammarFits: ['present-simple'],
    status: 'approved',
    ...overrides,
  });

  const mockSkillProfile = (overrides: Partial<UserSkillProfile> = {}): UserSkillProfile => ({
    vocabulary: {
      cefrLevel: 'A1',
      elo: 1000,
      weaknessScore: 0,
      progressToNextBand: 0,
      completedTasks: 0,
    },
    grammar: {
      cefrLevel: 'A1',
      elo: 1000,
      weaknessScore: 0,
      progressToNextBand: 0,
      completedTasks: 0,
    },
    reading: {
      cefrLevel: 'A1',
      elo: 1000,
      weaknessScore: 0,
      progressToNextBand: 0,
      completedTasks: 0,
    },
    writing: {
      cefrLevel: 'A1',
      elo: 1000,
      weaknessScore: 0,
      progressToNextBand: 0,
      completedTasks: 0,
    },
    listening: {
      cefrLevel: 'A1',
      elo: 1000,
      weaknessScore: 0,
      progressToNextBand: 0,
      completedTasks: 0,
    },
    speaking: {
      cefrLevel: 'A1',
      elo: 1000,
      weaknessScore: 0,
      progressToNextBand: 0,
      completedTasks: 0,
    },
    discipline: 'general',
    ...overrides,
  });

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_FEATURE_FLAG_UNIFIED_DIFFICULTY', 'false');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('selectGrammarForTask with flag false', () => {
    it('returns filtered rules without sorting by pool ratio', async () => {
      const rules = [
        mockRule({ id: 'z-rule', title: 'Z Rule', structure: 'subject verb object' }),
        mockRule({ id: 'a-rule', title: 'A Rule', structure: 'subject verb' }),
      ];
      (GrammarRepository.getGrammarRulesByLevel as vi.Mock).mockResolvedValue(rules);
      (GrammarProgressService.get as vi.Mock).mockReturnValue({ reviewStatus: 'New' });
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: ['subject', 'verb'],
      });

      const result = await GrammarEngine.selectGrammarForTask('grammar', 'A1', 'fill-blank');

      // Should return filtered rules in original order (no pool sorting)
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('z-rule');
      expect(result[1].id).toBe('a-rule');
    });

    it('applies task mix filtering', async () => {
      const rules = [
        mockRule({ id: 'r1', title: 'Strong Rule', structure: 'subject verb' }),
        mockRule({ id: 'r2', title: 'Weak Rule', structure: 'subject verb object' }),
      ];
      (GrammarRepository.getGrammarRulesByLevel as vi.Mock).mockResolvedValue(rules);
      (GrammarProgressService.get as vi.Mock)
        .mockReturnValueOnce({ reviewStatus: 'Strong', correctUsages: 5, incorrectUsages: 1 })
        .mockReturnValueOnce({ reviewStatus: 'Weak', correctUsages: 1, incorrectUsages: 5 });
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: [],
      });

      const safeResult = await GrammarEngine.selectGrammarForTask(
        'grammar',
        'A1',
        'fill-blank',
        undefined,
        'safe'
      );
      const stretchResult = await GrammarEngine.selectGrammarForTask(
        'grammar',
        'A1',
        'fill-blank',
        undefined,
        'stretch'
      );

      expect(safeResult.some((r) => r.id === 'r1')).toBe(true);
      expect(stretchResult.some((r) => r.id === 'r2')).toBe(true);
    });
  });

  describe('selectGrammarForTask with flag true', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_FEATURE_FLAG_UNIFIED_DIFFICULTY', 'true');
    });

    it('sorts grammar rules by pool ratio when flag is enabled', async () => {
      const rules = [
        mockRule({ id: 'r1', title: 'No Match', structure: 'unknown words here' }),
        mockRule({ id: 'r2', title: 'Partial Match', structure: 'subject unknown' }),
        mockRule({ id: 'r3', title: 'Full Match', structure: 'subject verb object' }),
      ];
      (GrammarRepository.getGrammarRulesByLevel as vi.Mock).mockResolvedValue(rules);
      (GrammarProgressService.get as vi.Mock).mockReturnValue({ reviewStatus: 'New' });
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: ['subject', 'verb', 'object'],
      });

      const result = await GrammarEngine.selectGrammarForTask('grammar', 'A1', 'fill-blank');

      // Should be sorted by pool ratio (highest overlap first)
      expect(result[0].id).toBe('r3');
      expect(result[1].id).toBe('r2');
      expect(result[2].id).toBe('r1');
    });

    it('uses vocabularyPool from learning store', async () => {
      const rules = [mockRule({ id: 'r1', title: 'Test Rule', structure: 'pool-term test' })];
      (GrammarRepository.getGrammarRulesByLevel as vi.Mock).mockResolvedValue(rules);
      (GrammarProgressService.get as vi.Mock).mockReturnValue({ reviewStatus: 'New' });
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: ['pool-term', 'other-term'],
      });

      const result = await GrammarEngine.selectGrammarForTask('grammar', 'A1', 'fill-blank');

      expect(result[0].id).toBe('r1');
      expect(useLearningStore.getState).toHaveBeenCalled();
    });

    it('handles empty pool gracefully', async () => {
      const rules = [
        mockRule({ id: 'r1', title: 'Test', structure: 'known words' }),
        mockRule({ id: 'r2', title: 'Test2', structure: 'unknown words' }),
      ];
      (GrammarRepository.getGrammarRulesByLevel as vi.Mock).mockResolvedValue(rules);
      (GrammarProgressService.get as vi.Mock).mockReturnValue({ reviewStatus: 'New' });
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: [],
      });

      const result = await GrammarEngine.selectGrammarForTask('grammar', 'A1', 'fill-blank');

      // Should return unsorted when pool is empty
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('r1');
      expect(result[1].id).toBe('r2');
    });
  });

  describe('selectGrammarForUserProfile', () => {
    it('delegates to selectGrammarForTask with profile level', async () => {
      const rules = [mockRule({ id: 'r1', title: 'Test' })];
      (GrammarRepository.getGrammarRulesByLevel as vi.Mock).mockResolvedValue(rules);
      (GrammarProgressService.get as vi.Mock).mockReturnValue({ reviewStatus: 'New' });
      (useLearningStore.getState as vi.Mock).mockReturnValue({
        vocabularyPool: [],
      });

      const profile = mockSkillProfile();
      const result = await GrammarEngine.selectGrammarForUserProfile(
        profile,
        'grammar',
        'fill-blank'
      );

      expect(result).toHaveLength(1);
      expect(GrammarRepository.getGrammarRulesByLevel).toHaveBeenCalledWith('A1');
    });

    it('returns empty array for missing skill profile', async () => {
      const profile = { ...mockSkillProfile(), grammar: undefined };
      const result = await GrammarEngine.selectGrammarForUserProfile(
        profile as UserSkillProfile,
        'grammar',
        'fill-blank'
      );

      expect(result).toEqual([]);
    });
  });

  describe('validateGrammarEligibility', () => {
    it('returns false for unapproved rules', () => {
      const rule = mockRule({ status: 'draft' });
      expect(GrammarEngine.validateGrammarEligibility(rule, 'grammar', 'A1')).toBe(false);
    });

    it('returns false for CEFR level above user level', () => {
      const rule = mockRule({ cefrLevel: 'B2' });
      expect(GrammarEngine.validateGrammarEligibility(rule, 'grammar', 'A1')).toBe(false);
    });

    it('returns false for skill mismatch', () => {
      const rule = mockRule({ skillUse: ['vocabulary'] });
      expect(GrammarEngine.validateGrammarEligibility(rule, 'grammar', 'A1')).toBe(false);
    });

    it('returns true for eligible rules', () => {
      const rule = mockRule({ status: 'approved', cefrLevel: 'A1', skillUse: ['grammar'] });
      expect(GrammarEngine.validateGrammarEligibility(rule, 'grammar', 'A1')).toBe(true);
    });
  });
});
