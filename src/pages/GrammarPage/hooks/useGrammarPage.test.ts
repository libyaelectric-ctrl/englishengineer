import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GrammarRule } from '@/shared/types/grammar.types';

import { type SubscriptionSnapshot, useBillingStore } from '@/features/billing';
import { useGrammarStore } from '@/features/grammar';
import { GrammarProgressService, GrammarRepository } from '@/features/grammar';
import { VocabularyRepository } from '@/features/vocabulary';

import { useGrammarPage } from './useGrammarPage';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('@/features/billing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/billing')>();
  return { ...actual, useBillingStore: vi.fn() };
});

vi.mock('@/features/profile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/profile')>();
  return {
    ...actual,
    useLearningCockpit: vi.fn(() => ({
      profile: { skills: { grammar: { cefrBand: 'A1' } } },
    })),
    getBaseCefrLevel: vi.fn((band: string) => band.replace('+', '')),
  };
});

vi.mock('@/features/grammar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/grammar')>();
  return {
    ...actual,
    GrammarRepository: {
      getAllRulesSorted: vi.fn(),
      getGrammarRulesByLevel: vi.fn(),
    },
    GrammarProgressService: {
      isLessonUnlocked: vi.fn(),
      get: vi.fn(),
    },
  };
});

vi.mock('@/features/vocabulary', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/vocabulary')>();
  return {
    ...actual,
    VocabularyRepository: {
      getVocabularyForUserSkillLevel: vi.fn(),
    },
  };
});

const makeRule = (id: string, grammarCategory: string, title = id): GrammarRule => ({
  id,
  title,
  cefrLevel: 'A1',
  ruleCefrLevel: 'A1',
  grammarCategory,
  ruleType: 'pattern',
  importTier: 'tier-1',
  ruleTitle: title,
  definition: 'definition',
  explanation: 'explanation',
  structure: 'structure',
  coreStructure: 'coreStructure',
  examplePattern: 'examplePattern',
  languageFunction: 'languageFunction',
  progressionFamily: 'progressionFamily',
  turkishExplanation: 'turkishExplanation',
  engineeringUseCase: 'engineeringUseCase',
  examples: [],
  badExampleEnglish: 'badExampleEnglish',
  badExampleTurkishExplanation: 'badExampleTurkishExplanation',
  correctedExampleEnglish: 'correctedExampleEnglish',
  mistakeType: 'mistakeType',
  commonMistakes: 'commonMistakes',
  skillUse: [],
  linkedVocabularyTags: [],
  grammarFits: [],
  difficulty: 1,
  prerequisites: [],
  canGenerateTaskTypes: [],
  domainFit: [],
  taskPromptTemplate: '',
  minimumUserOutput: '',
  masteryCriteria: '',
  exampleCefrLevel: 'A1',
  status: 'active',
  confidence: 1,
  cefrConfidence: 1,
  exampleQualityScore: 1,
  engineeringRelevanceScore: 1,
  taskGenerationScore: 1,
  importReadinessScore: 1,
  notes: '',
});

// First module ('articles' -> 'Nouns and Articles') is free; second module
// ('conjunctions' -> 'Connecting Ideas') must be locked on the free tier.
const FIRST_RULE = makeRule('articles-1', 'articles', 'Definite article');
const SECOND_RULE = makeRule('conjunctions-1', 'conjunctions', 'And / But / Or');
const RULES = [FIRST_RULE, SECOND_RULE];

const DEFAULT_PROGRESS = {
  ruleId: 'x',
  exposures: 0,
  correctUsages: 0,
  incorrectUsages: 0,
  strength: 0,
  reviewStatus: 'New',
  lastUsedAt: null,
  nextReviewDate: null,
  skillEvidence: {},
  isPassed: false,
};

const freeSubscription: SubscriptionSnapshot = {
  planId: 'free',
  status: 'none',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  updatedAt: '2026-08-17T00:00:00.000Z',
};

const paidSubscription: SubscriptionSnapshot = {
  ...freeSubscription,
  planId: 'master',
  status: 'active',
};

const mockedUseBillingStore = vi.mocked(useBillingStore);

const setSubscription = (subscription: SubscriptionSnapshot) => {
  mockedUseBillingStore.mockImplementation(
    (selector: (state: { subscription: SubscriptionSnapshot }) => unknown) =>
      selector({ subscription })
  );
};

const renderPage = () => renderHook(() => useGrammarPage());

describe('useGrammarPage free-tier grammar gate', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    useGrammarStore.setState({
      rules: [],
      selectedId: null,
      tab: 'New',
      query: '',
      ruleProgress: {},
      stats: { total: 0, newCount: 0, learning: 0, learned: 0, mastered: 0, struggling: 0 },
    });
    vi.mocked(GrammarRepository.getAllRulesSorted).mockResolvedValue(RULES);
    vi.mocked(GrammarRepository.getGrammarRulesByLevel).mockResolvedValue([]);
    vi.mocked(VocabularyRepository.getVocabularyForUserSkillLevel).mockResolvedValue([]);
    vi.mocked(GrammarProgressService.isLessonUnlocked).mockResolvedValue(true);
    vi.mocked(GrammarProgressService.get).mockReturnValue({ ...DEFAULT_PROGRESS });
  });

  it('lets a free-tier user select a rule from the first module without redirecting', async () => {
    setSubscription(freeSubscription);

    const { result } = renderPage();
    await waitFor(() => expect(result.current.selectedId).toBe(FIRST_RULE.id));

    act(() => result.current.selectRule(FIRST_RULE.id));

    expect(navigateMock).not.toHaveBeenCalled();
    expect(result.current.selectedId).toBe(FIRST_RULE.id);

    await act(async () => {}); // flush remaining async effects
  });

  it('redirects to /pricing when a free-tier user selects a rule outside the first module', async () => {
    setSubscription(freeSubscription);

    const { result } = renderPage();
    await waitFor(() => expect(result.current.selectedId).toBe(FIRST_RULE.id));

    act(() => result.current.selectRule(SECOND_RULE.id));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/pricing');
    // Selection must not change — the locked rule is not applied.
    expect(result.current.selectedId).toBe(FIRST_RULE.id);

    await act(async () => {}); // flush remaining async effects
  });

  it('lets a paid user select a rule from any module without redirecting', async () => {
    setSubscription(paidSubscription);

    const { result } = renderPage();
    await waitFor(() => expect(result.current.selectedId).toBe(FIRST_RULE.id));

    act(() => result.current.selectRule(SECOND_RULE.id));

    expect(navigateMock).not.toHaveBeenCalled();
    expect(result.current.selectedId).toBe(SECOND_RULE.id);

    await act(async () => {}); // flush remaining async effects
  });

  it('treats the legacy junior+none subscription as free tier and gates non-first modules', async () => {
    setSubscription({ ...freeSubscription, planId: 'junior' });

    const { result } = renderPage();
    await waitFor(() => expect(result.current.selectedId).toBe(FIRST_RULE.id));

    act(() => result.current.selectRule(SECOND_RULE.id));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/pricing');
    expect(result.current.selectedId).toBe(FIRST_RULE.id);

    await act(async () => {}); // flush remaining async effects
  });
});
