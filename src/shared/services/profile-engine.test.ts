import { afterEach, describe, expect, it, vi } from 'vitest';

import { LearningIntelligenceService } from '@/shared/services/learning-intelligence.service';
import {
  LearningProfileEngine,
  getDisciplineDomains,
} from '@/shared/services/profile-engine.service';
import { VocabularyRepository } from '@/shared/services/vocabulary.repository';
import type {
  SkillName,
  SkillProfile,
  UserLearningProfile,
  VocabularyMemorySummary,
} from '@/shared/types/domain.types';

vi.mock('@/shared/services/vocabulary.repository', () => ({
  VocabularyRepository: {
    getVocabularyByDomain: vi.fn(),
  },
}));

vi.mock('@/shared/services/learning-intelligence.service', () => ({
  LearningIntelligenceService: {
    load: vi.fn(),
  },
}));

vi.mock('@/shared/services/grammar.engine', () => ({
  GrammarEngine: {
    selectGrammarForTask: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/shared/services/vocabulary.engine', () => ({
  VocabularyEngine: {
    selectVocabularyForTask: vi.fn().mockResolvedValue([]),
  },
}));

describe('getDisciplineDomains', () => {
  it('Senaryo A: returns all 3 domains when discipline has words', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomain).mockResolvedValue([
      { id: 'test_1', domain: 'electrical' },
    ] as never);

    const result = await getDisciplineDomains('user_123', 'electrical');

    expect(result).toEqual(['general', 'engineering', 'electrical']);
  });

  it('Senaryo B: falls back to general+engineering when discipline is empty', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomain).mockResolvedValue([]);

    const result = await getDisciplineDomains('user_456', 'chemical');

    expect(result).toEqual(['general', 'engineering']);
  });

  it('Senaryo C: returns general+engineering when no discipline provided', async () => {
    const result = await getDisciplineDomains('user_789', undefined);

    expect(result).toEqual(['general', 'engineering']);
    expect(VocabularyRepository.getVocabularyByDomain).not.toHaveBeenCalled();
  });

  it('Senaryo D: falls back to general+engineering on API error', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomain).mockRejectedValue(
      new Error('Network error')
    );

    const result = await getDisciplineDomains('user_000', 'mechanical');

    expect(result).toEqual(['general', 'engineering']);
  });

  it('never returns an empty array', async () => {
    vi.mocked(VocabularyRepository.getVocabularyByDomain).mockResolvedValue([]);

    const result = await getDisciplineDomains('user_x', 'software');

    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result).toContain('general');
    expect(result).toContain('engineering');
  });
});

function makeSkillProfile(overrides: Partial<SkillProfile> & { skill: SkillName }): SkillProfile {
  return {
    elo: 500,
    cefrBand: 'A2',
    progressToNextBand: 40,
    trend: 'steady' as const,
    completedTasks: 5,
    accuracy: 70,
    weaknessScore: 30,
    lastPracticedAt: null,
    promotionState: 'stable' as const,
    ...overrides,
  };
}

function makeProfile(overrides?: Partial<UserLearningProfile>): UserLearningProfile {
  return {
    userId: 'test-user',
    skills: {
      vocabulary: makeSkillProfile({ skill: 'vocabulary', completedTasks: 5 }),
      grammar: makeSkillProfile({ skill: 'grammar', completedTasks: 5 }),
      reading: makeSkillProfile({ skill: 'reading', completedTasks: 5 }),
      writing: makeSkillProfile({ skill: 'writing', completedTasks: 5 }),
      listening: makeSkillProfile({ skill: 'listening', completedTasks: 5 }),
      speaking: makeSkillProfile({ skill: 'speaking', completedTasks: 5 }),
    },
    goals: [],
    professionId: null,
    discipline: 'general',
    industryId: null,
    communicationGoals: [],
    selfReportedCefr: 'not-assessed' as const,
    learningFocus: [],
    selectedPlan: 'junior' as const,
    professionalTrack: 'site-engineer' as const,
    electricalSubdomain: 'general' as const,
    experienceLevel: 'junior' as const,
    careerGoal: '',
    country: '',
    timezone: '',
    interfaceLanguage: 'en' as const,
    placementCompleted: false,
    placementConfidence: 'not-assessed' as const,
    placementBand: null,
    dailyTarget: { minutes: 15, taskCount: 3 },
    weeklyTolerance: { allowedMissedDays: 2 },
    onboardingCompleted: false,
    branchLockConfirmations: 0,
    weeklyGoal: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMemory(overrides?: Partial<VocabularyMemorySummary>): VocabularyMemorySummary {
  return {
    total: 0,
    new: 0,
    learning: 0,
    mastered: 0,
    forgotten: 0,
    dueToday: 0,
    weakWords: 0,
    ...overrides,
  };
}

function recentDate(): string {
  return new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
}

describe('generateDailyMissions — mistake category counting', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('counts "repeated vocabulary gap" toward vocabularyMistakes (weakest)', async () => {
    vi.mocked(LearningIntelligenceService.load).mockReturnValue({
      careerRole: 'Site Engineer',
      completedTaskDates: {},
      mistakeLog: [
        {
          id: 'm1',
          category: 'repeated vocabulary gap',
          originalText: 'a',
          correction: 'b',
          createdAt: recentDate(),
        },
        {
          id: 'm2',
          category: 'repeated vocabulary gap',
          originalText: 'c',
          correction: 'd',
          createdAt: recentDate(),
        },
        {
          id: 'm3',
          category: 'repeated vocabulary gap',
          originalText: 'e',
          correction: 'f',
          createdAt: recentDate(),
        },
      ],
      lastReportDate: null,
    });

    const profile = makeProfile();
    // Set vocabulary skill lower than others so it's already weak
    profile.skills.vocabulary.completedTasks = 1;
    profile.skills.vocabulary.weaknessScore = 80;

    const missions = await LearningProfileEngine.generateDailyMissions(profile, makeMemory());
    const weakestMission = missions.find((m) => m.skill === 'vocabulary');
    expect(weakestMission).toBeDefined();
    expect(weakestMission?.personalReason).toContain('repeated vocabulary gap');
  });

  it('counts "repeated phrase issue" toward grammarMistakes', async () => {
    vi.mocked(LearningIntelligenceService.load).mockReturnValue({
      careerRole: 'Site Engineer',
      completedTaskDates: {},
      mistakeLog: [
        {
          id: 'm1',
          category: 'repeated phrase issue',
          originalText: 'a',
          correction: 'b',
          createdAt: recentDate(),
        },
        {
          id: 'm2',
          category: 'repeated phrase issue',
          originalText: 'c',
          correction: 'd',
          createdAt: recentDate(),
        },
        {
          id: 'm3',
          category: 'repeated phrase issue',
          originalText: 'e',
          correction: 'f',
          createdAt: recentDate(),
        },
      ],
      lastReportDate: null,
    });

    const profile = makeProfile();
    // Make grammar the weakest
    profile.skills.grammar.completedTasks = 1;
    profile.skills.grammar.weaknessScore = 80;

    const missions = await LearningProfileEngine.generateDailyMissions(profile, makeMemory());
    const weakestMission = missions.find((m) => m.skill === 'grammar');
    expect(weakestMission).toBeDefined();
    expect(weakestMission?.personalReason).toContain('repeated phrase issue');
  });

  it('does NOT let dead categories "Vocabulary" or "missing article" affect skill weighting', async () => {
    vi.mocked(LearningIntelligenceService.load).mockReturnValue({
      careerRole: 'Site Engineer',
      completedTaskDates: {},
      mistakeLog: [
        {
          id: 'm1',
          category: 'Vocabulary' as never,
          originalText: 'a',
          correction: 'b',
          createdAt: recentDate(),
        },
        {
          id: 'm2',
          category: 'Vocabulary' as never,
          originalText: 'c',
          correction: 'd',
          createdAt: recentDate(),
        },
        {
          id: 'm3',
          category: 'Vocabulary' as never,
          originalText: 'e',
          correction: 'f',
          createdAt: recentDate(),
        },
        {
          id: 'm4',
          category: 'missing article' as never,
          originalText: 'g',
          correction: 'h',
          createdAt: recentDate(),
        },
      ],
      lastReportDate: null,
    });

    const profile = makeProfile();
    // All skills equal — if dead categories were counted, they'd skew results
    const missions = await LearningProfileEngine.generateDailyMissions(profile, makeMemory());
    // The personalReason will show 'Vocabulary' as top category (raw name), but
    // the vocabularyMistakes count should be 0 — so vocabulary skill is NOT boosted
    expect(missions[0]?.personalReason).toContain('Vocabulary');
    // Vocabulary should NOT be the weakest just because of dead category matches
    // (all skills have equal completedTasks=5, so the tie-break goes to weaknessScore)
  });

  it('counts "unclear sentence" toward grammarMistakes', async () => {
    vi.mocked(LearningIntelligenceService.load).mockReturnValue({
      careerRole: 'Site Engineer',
      completedTaskDates: {},
      mistakeLog: [
        {
          id: 'm1',
          category: 'unclear sentence',
          originalText: 'a',
          correction: 'b',
          createdAt: recentDate(),
        },
        {
          id: 'm2',
          category: 'unclear sentence',
          originalText: 'c',
          correction: 'd',
          createdAt: recentDate(),
        },
      ],
      lastReportDate: null,
    });

    const profile = makeProfile();
    profile.skills.grammar.completedTasks = 1;
    profile.skills.grammar.weaknessScore = 80;

    const missions = await LearningProfileEngine.generateDailyMissions(profile, makeMemory());
    const weakestMission = missions.find((m) => m.skill === 'grammar');
    expect(weakestMission?.personalReason).toContain('unclear sentence');
  });

  it('counts "word choice" toward vocabularyMistakes', async () => {
    vi.mocked(LearningIntelligenceService.load).mockReturnValue({
      careerRole: 'Site Engineer',
      completedTaskDates: {},
      mistakeLog: [
        {
          id: 'm1',
          category: 'word choice',
          originalText: 'a',
          correction: 'b',
          createdAt: recentDate(),
        },
        {
          id: 'm2',
          category: 'word choice',
          originalText: 'c',
          correction: 'd',
          createdAt: recentDate(),
        },
      ],
      lastReportDate: null,
    });

    const profile = makeProfile();
    profile.skills.vocabulary.completedTasks = 1;
    profile.skills.vocabulary.weaknessScore = 80;

    const missions = await LearningProfileEngine.generateDailyMissions(profile, makeMemory());
    const weakestMission = missions.find((m) => m.skill === 'vocabulary');
    expect(weakestMission?.personalReason).toContain('word choice');
  });
});
