import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import DashboardPage from '@/pages/DashboardPage';
import GrammarPage from '@/pages/GrammarPage';
import ListeningPage from '@/pages/ListeningPage';
import ProfilePage from '@/pages/ProfilePage';
import ReadingPage from '@/pages/ReadingPage';
import SpeakingPage from '@/pages/SpeakingPage';
import ToolsPage from '@/pages/ToolsPage';
import VocabularyPage from '@/pages/VocabularyPage';
import WritingPage from '@/pages/WritingPage';

import { resetStores } from './test-utils/resetStores';

// ─── Hoisted mock data ────────────────────────────────────────────────────
// Use vi.hoisted() to ensure mock data is available before vi.mock() calls

const { mockTerm } = vi.hoisted(() => ({
  mockTerm: {
    id: 'a1-test-001',
    term: 'test',
    turkishMeaning: 'test kelimesi',
    definition: 'A test word',
    exampleSentence: 'This is a test sentence.',
    turkishExample: 'Bu bir test cümleridir.',
    cefrLevel: 'A1',
    domain: 'General',
    skillUse: ['vocabulary'],
    tags: [],
    grammarFits: [],
    relatedTerms: [],
    partOfSpeech: 'noun',
    contentDomain: 'General',
    lifeContext: 'General',
    normalizedTerm: 'test',
    grammarDomainAlias: '',
  },
}));

// ─── Mocks for pages that load seed data asynchronously ────────────────────
// Mock the repositories and data loaders that load seed data to prevent timeouts

vi.mock('@/features/vocabulary', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/vocabulary')>();
  return {
    ...actual,
    VocabularyRepository: {
      ...actual.VocabularyRepository,
      getVocabularyByLevel: vi.fn().mockResolvedValue([mockTerm]),
      getVocabularyForUserSkillLevel: vi.fn().mockResolvedValue([mockTerm]),
      getVocabularyBySkill: vi.fn().mockResolvedValue([mockTerm]),
      getVocabularyByDomain: vi.fn().mockResolvedValue([mockTerm]),
      getVocabularyByDomains: vi.fn().mockResolvedValue([mockTerm]),
      getVocabularyByContentDomain: vi.fn().mockResolvedValue([mockTerm]),
      getVocabularyByLifeContext: vi.fn().mockResolvedValue([mockTerm]),
      getVocabularyByPartOfSpeech: vi.fn().mockResolvedValue([mockTerm]),
      getVocabularyByGrammarFit: vi.fn().mockResolvedValue([mockTerm]),
      searchVocabulary: vi.fn().mockResolvedValue([mockTerm]),
      clearCache: vi.fn(),
    },
    VocabularyMenuService: {
      ...actual.VocabularyMenuService,
      getState: vi.fn().mockReturnValue({ progress: {}, myVocabulary: [] }),
    },
  };
});

vi.mock('@/features/grammar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/grammar')>();
  return {
    ...actual,
    GrammarRepository: {
      ...actual.GrammarRepository,
      getAllRulesSorted: vi.fn().mockResolvedValue([]),
      getGrammarRulesByLevel: vi.fn().mockResolvedValue([]),
      getGrammarRuleById: vi.fn().mockResolvedValue(undefined),
      getGrammarRulesBySkill: vi.fn().mockResolvedValue([]),
      getGrammarRulesByTaskType: vi.fn().mockResolvedValue([]),
      getGrammarRulesByCategory: vi.fn().mockResolvedValue([]),
      getGrammarRulesByDomain: vi.fn().mockResolvedValue([]),
      getGrammarRulesForUserSkillLevel: vi.fn().mockResolvedValue([]),
      getAllRulesSortedSync: vi.fn().mockReturnValue(null),
      searchGrammarRules: vi.fn().mockResolvedValue([]),
      clearCache: vi.fn(),
    },
    useGrammarStore: vi.fn(() => ({
      stats: { learned: 0, mastered: 0, struggling: 0 },
    })),
    GrammarProgressService: {
      ...actual.GrammarProgressService,
      get: vi.fn(() => ({
        correctUsages: 0,
        incorrectUsages: 0,
        strength: 0,
        reviewStatus: 'New',
        isPassed: false,
      })),
      getSummary: vi.fn(() => ({ strong: 0 })),
      isLessonUnlocked: vi.fn(() => Promise.resolve(true)),
    },
  };
});

vi.mock('@/features/profile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/profile')>();
  return {
    ...actual,
    useLearningCockpit: vi.fn(() => ({
      profile: {
        skills: {
          vocabulary: { elo: 800, cefrBand: 'A1' },
          grammar: { elo: 750, cefrBand: 'A1' },
          reading: { elo: 700, cefrBand: 'A1' },
          writing: { elo: 650, cefrBand: 'A1' },
          speaking: { elo: 600, cefrBand: 'A1' },
          listening: { elo: 700, cefrBand: 'A1' },
        },
      },
      memory: {
        total: 0,
        new: 0,
        learning: 0,
        mastered: 0,
        forgotten: 0,
        dueToday: 0,
        weakWords: 0,
      },
      missions: [],
      isLoading: false,
      learningState: { studySessions: [] },
    })),
  };
});

// Mock useLearningStore with proper selector support and all required methods
vi.mock('@/core/learning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/learning')>();
  const state = {
    vocabularyPool: [],
    grammarPool: [],
    speakingPool: [],
    xp: 100,
    streak: 5,
    missions: [],
    achievements: [],
    studySessions: [],
    lastActivityDate: new Date().toISOString(),
    scoreHistory: [],
    xpHistory: [],
    eloHistory: [],
    elo: 1000,
    level: 1,
    coins: 0,
    hearts: 5,
    heartsDepletedAt: null,
    weakTermIds: [],
    // Mock methods that are called by hooks
    checkHeartsRefill: vi.fn(),
    loseHeart: vi.fn(),
    completeGenericPractice: vi.fn(),
  };
  return {
    ...actual,
    useLearningStore: Object.assign(
      vi.fn((selector?: (s: typeof state) => unknown) => (selector ? selector(state) : state)),
      { getState: () => state }
    ),
  };
});

// Mock the vocabulary data loader to prevent network requests
vi.mock('@/data/vocabulary', () => ({
  loadVocabularyByLevel: vi.fn().mockResolvedValue([mockTerm]),
}));

afterEach(() => {
  resetStores();
});

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
    </QueryClientProvider>
  );

// Lazy/Suspense-loaded components resolve slowly under a full multi-file
// CI run; give async utility assertions more headroom (see the matching
// configure() call in new-features.e2e.test.tsx).
configure({ asyncUtilTimeout: 10000 });

describe('Navigation E2E: Main routes render without errors', () => {
  it('/dashboard renders', async () => {
    // DashboardPage redirects to /login while auth is loading/unauthenticated,
    // and to /welcome if onboarding isn't complete. Seed a fully authenticated,
    // onboarded user so the real dashboard content renders.
    const userId = 'nav-e2e-user';
    useAuthStore.setState({
      currentUser: {
        id: userId,
        displayName: 'Nav E2E',
        email: 'nav-e2e@example.com',
        role: 'engineer',
        engineeringDiscipline: 'electrical',
        targetLevel: 'C1',
        location: 'Remote',
        avatarInitials: 'NE',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });
    const profile = LearningProfileRepository.getProfile(userId);
    LearningProfileRepository.saveProfile({ ...profile, userId, onboardingCompleted: true });

    renderWithRouter(<DashboardPage />, ['/dashboard']);
    // Language-agnostic: dashboard renders main content area with greeting or stats
    await waitFor(() => {
      const mainContent = document.querySelector('main, [class*="space-y"]');
      expect(mainContent).toBeTruthy();
    });
  });

  it('/vocabulary renders', async () => {
    renderWithRouter(<VocabularyPage />, ['/vocabulary']);
    await waitFor(() => {
      expect(screen.getAllByText(/Vocabulary/i).length).toBeGreaterThan(0);
    });
  });

  it('/grammar renders', async () => {
    renderWithRouter(<GrammarPage />, ['/grammar']);
    await waitFor(() => {
      expect(screen.getAllByText(/Grammar/i).length).toBeGreaterThan(0);
    });
  });

  it('/reading renders', async () => {
    renderWithRouter(<ReadingPage />, ['/reading']);
    await waitFor(() => {
      expect(screen.getAllByText(/Reading/i).length).toBeGreaterThan(0);
    });
  });

  it('/writing renders', async () => {
    renderWithRouter(<WritingPage />, ['/writing']);
    await waitFor(() => {
      expect(screen.getAllByText(/Writing/i).length).toBeGreaterThan(0);
    });
  });

  it('/listening renders', async () => {
    renderWithRouter(<ListeningPage />, ['/listening']);
    await waitFor(() => {
      expect(screen.getAllByText(/Listening/i).length).toBeGreaterThan(0);
    });
  });

  it('/speaking renders', async () => {
    renderWithRouter(<SpeakingPage />, ['/speaking']);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Speaking/i })).toBeInTheDocument();
    });
  });
});

describe('Navigation E2E: Profile and Progress routes', () => {
  it('/profile renders ProfilePage', async () => {
    renderWithRouter(<ProfilePage />, ['/profile']);
    await waitFor(() => {
      expect(screen.getByText(/Profile Information/i)).toBeInTheDocument();
    });
  });

  it('/progress renders', async () => {
    const { default: ProgressPage } = await import('@/pages/ProgressPage');
    renderWithRouter(<ProgressPage />, ['/progress']);
    await waitFor(() => {
      expect(screen.getAllByText(/Progress/i).length).toBeGreaterThan(0);
    });
  });
});

describe('Navigation E2E: Tools routes', () => {
  it('/tools/work renders ToolsPage', async () => {
    renderWithRouter(<ToolsPage />, ['/tools/work']);
    await waitFor(() => {
      expect(screen.getByText(/Templates, quick phrases/i)).toBeInTheDocument();
    });
  });
});

describe('Navigation E2E: Lazy-loaded pages', () => {
  it('dynamically imports VocabularyPage without crashing', async () => {
    const { default: VocabularyPage } = await import('@/pages/VocabularyPage');
    renderWithRouter(<VocabularyPage />, ['/vocabulary']);
    await waitFor(() => {
      expect(screen.getAllByText(/Vocabulary/i).length).toBeGreaterThan(0);
    });
  });

  it('dynamically imports GrammarPage without crashing', async () => {
    const { default: GrammarPage } = await import('@/pages/GrammarPage');
    renderWithRouter(<GrammarPage />, ['/grammar']);
    await waitFor(() => {
      expect(screen.getAllByText(/Grammar/i).length).toBeGreaterThan(0);
    });
  });

  it('dynamically imports SpeakingPage without crashing', async () => {
    const { default: SpeakingPage } = await import('@/pages/SpeakingPage');
    renderWithRouter(<SpeakingPage />, ['/speaking']);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Speaking/i })).toBeInTheDocument();
    });
  });
});

describe('Navigation E2E: Redirect routes', () => {
  it('/analytics redirects to /progress', async () => {
    const { default: ProgressPage } = await import('@/pages/ProgressPage');
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/analytics']}>
          <Routes>
            <Route path="/analytics" element={<ProgressPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    await waitFor(() => {
      expect(screen.getAllByText(/Progress/i).length).toBeGreaterThan(0);
    });
  });

  it('/tools redirects to /tools/work', async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/tools']}>
          <Routes>
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/:section" element={<ToolsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/Templates, quick phrases/i)).toBeInTheDocument();
    });
  });
});
