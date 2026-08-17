import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

import { type SubscriptionSnapshot, useBillingStore } from '@/features/billing';
import {
  VocabularyMenuService,
  VocabularyRepository,
  selectVocabularyLearningSet,
} from '@/features/vocabulary';

import { useVocabularyPage } from './useVocabularyPage';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

vi.mock('@/features/billing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/billing')>();
  return { ...actual, useBillingStore: vi.fn() };
});

vi.mock('@/features/profile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/profile')>();
  return {
    ...actual,
    LearningProfileRepository: {
      getProfile: vi.fn(() => ({
        discipline: 'civil',
        skills: { vocabulary: { cefrBand: 'B1' } },
      })),
    },
    getBaseCefrLevel: vi.fn((band: string) => band.replace('+', '')),
    getPreferredDomains: vi.fn(() => []),
  };
});

vi.mock('@/features/vocabulary', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/vocabulary')>();
  return {
    ...actual,
    VocabularyRepository: { getVocabularyByLevel: vi.fn() },
    VocabularyMenuService: {
      getState: vi.fn(() => ({ progress: {}, myVocabulary: [] })),
      reviewWord: vi.fn(),
      startLearning: vi.fn(),
      addToMyVocabulary: vi.fn(),
    },
    selectVocabularyLearningSet: vi.fn((terms: VocabularyTerm[]) => terms),
    searchVocabularyMenu: vi.fn(() => []),
    isVocabularyProgressDue: vi.fn(() => false),
    repairVocabularyText: vi.fn((value: string) => value),
  };
});

const makeTerm = (index: number): VocabularyTerm => ({
  id: `term-${index}`,
  term: `term ${index}`,
  normalizedTerm: `term ${index}`,
  turkishMeaning: `anlam ${index}`,
  cefrLevel: 'B1',
  domain: 'civil',
  contentDomain: 'civil',
  lifeContext: 'site',
  register: 'technical',
  primaryUseCase: 'usage',
  category: 'core',
  termType: 'word',
  partOfSpeech: 'noun',
  wordCount: 1,
  definition: 'definition',
  exampleSentence: 'example sentence',
  turkishExample: 'turkce ornek',
  relatedTerms: [],
  commonMistakes: '',
  grammarFits: [],
  skillUse: ['vocabulary'],
  tags: [],
  source: 'EngVox Dictionary',
  confidence: 1,
  status: 'approved',
  importTier: 'core',
  isCore: true,
  isTechnical: false,
  isProfessionalPhrase: false,
  isContractual: false,
  isDailySiteEnglish: true,
  isLifeWideEnglish: false,
  reviewReason: '',
  variantOf: '',
  grammarDomainAlias: '',
  qcRepairNotes: '',
});

// A full page (15) plus enough terms for a second page.
const TERMS = Array.from({ length: 20 }, (_, i) => makeTerm(i));

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

const renderPage = () => renderHook(() => useVocabularyPage());

describe('useVocabularyPage free-tier single-page limit', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    vi.mocked(VocabularyRepository.getVocabularyByLevel).mockResolvedValue(TERMS);
    vi.mocked(selectVocabularyLearningSet).mockClear();
    vi.mocked(VocabularyMenuService.getState).mockReturnValue({ progress: {}, myVocabulary: [] });
  });

  it('redirects to /pricing when a free-tier user requests the next batch', async () => {
    setSubscription(freeSubscription);

    const { result } = renderPage();
    await waitFor(() => expect(result.current.terms).toHaveLength(20));
    await waitFor(() => expect(result.current.wordSet).toHaveLength(20));

    const selectionCallsBefore = vi.mocked(selectVocabularyLearningSet).mock.calls.length;

    act(() => result.current.loadNextBatch());

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/pricing');
    // The gate short-circuits before building the next page.
    expect(vi.mocked(selectVocabularyLearningSet).mock.calls.length).toBe(selectionCallsBefore);
    expect(result.current.wordSet).toHaveLength(20);
  });

  it('treats the legacy junior+none subscription as free tier and locks the next batch', async () => {
    setSubscription({ ...freeSubscription, planId: 'junior' });

    const { result } = renderPage();
    await waitFor(() => expect(result.current.terms).toHaveLength(20));

    act(() => result.current.loadNextBatch());

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/pricing');
  });

  it('lets a paid user request the next batch without redirecting', async () => {
    setSubscription(paidSubscription);

    const { result } = renderPage();
    await waitFor(() => expect(result.current.terms).toHaveLength(20));
    await waitFor(() => expect(result.current.wordSet).toHaveLength(20));

    const selectionCallsBefore = vi.mocked(selectVocabularyLearningSet).mock.calls.length;

    act(() => result.current.loadNextBatch());

    expect(navigateMock).not.toHaveBeenCalled();
    // The next batch is actually built for paying users.
    expect(vi.mocked(selectVocabularyLearningSet).mock.calls.length).toBeGreaterThan(
      selectionCallsBefore
    );

    await act(async () => {}); // flush remaining async effects
  });
});
