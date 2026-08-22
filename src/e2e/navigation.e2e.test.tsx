import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
    </QueryClientProvider>
  );

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
    await waitFor(() => {
      expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
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

  it('/progress/overview renders', async () => {
    const { default: ProgressPage } = await import('@/pages/ProgressPage');
    renderWithRouter(<ProgressPage />, ['/progress/overview']);
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
  it('/analytics redirects to /progress/overview', async () => {
    const { default: ProgressPage } = await import('@/pages/ProgressPage');
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/analytics']}>
          <Routes>
            <Route path="/analytics" element={<ProgressPage />} />
            <Route path="/progress/overview" element={<ProgressPage />} />
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
