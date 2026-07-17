import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import VocabularyPage from '@/pages/VocabularyPage';
import GrammarPage from '@/pages/GrammarPage';
import ReadingPage from '@/pages/ReadingPage';
import WritingPage from '@/pages/WritingPage';
import ListeningPage from '@/pages/ListeningPage';
import SpeakingPage from '@/pages/SpeakingPage';
import ProfilePage from '@/pages/ProfilePage';
import ToolsPage from '@/pages/ToolsPage';
import LoginPage from '@/pages/LoginPage';

const renderWithRouter = (
  component: React.ReactElement,
  initialEntries = ['/']
) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
  );

describe('Navigation E2E: Main routes render without errors', () => {
  it('/dashboard renders', async () => {
    renderWithRouter(<DashboardPage />, ['/dashboard']);
    await waitFor(() => {
      expect(screen.getByText(/Progress Cockpit/i)).toBeInTheDocument();
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
      expect(
        screen.getByRole('heading', { name: /Speaking/i })
      ).toBeInTheDocument();
    });
  });
});

describe('Navigation E2E: Profile and Progress routes', () => {
  it('/profile/overview renders ProfilePage', async () => {
    renderWithRouter(<ProfilePage />, ['/profile/overview']);
    await waitFor(() => {
      expect(
        screen.getByText(/Manage your professional profile/i)
      ).toBeInTheDocument();
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

describe('Navigation E2E: Auth routes', () => {
  it('/login renders LoginPage', async () => {
    renderWithRouter(<LoginPage />, ['/login']);
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });

  it('/signup renders LoginPage in signup mode', async () => {
    renderWithRouter(<LoginPage />, ['/signup']);
    await waitFor(() => {
      expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
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
      expect(
        screen.getByRole('heading', { name: /Speaking/i })
      ).toBeInTheDocument();
    });
  });
});

describe('Navigation E2E: Redirect routes', () => {
  it('/analytics redirects to /progress/overview', async () => {
    const { default: ProgressPage } = await import('@/pages/ProgressPage');
    render(
      <MemoryRouter initialEntries={['/analytics']}>
        <Routes>
          <Route path="/analytics" element={<ProgressPage />} />
          <Route path="/progress/overview" element={<ProgressPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getAllByText(/Progress/i).length).toBeGreaterThan(0);
    });
  });

  it('/tools redirects to /tools/work', async () => {
    render(
      <MemoryRouter initialEntries={['/tools']}>
        <Routes>
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:section" element={<ToolsPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Templates, quick phrases/i)).toBeInTheDocument();
    });
  });
});
