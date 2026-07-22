import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WorkToolsPage from '@/pages/WorkToolsPage';
import SpeakingPage from '@/pages/SpeakingPage';
import TeamPage from '@/pages/TeamPage';
import { useReadingStore } from '@/features/reading';
import { useWritingStore } from '@/features/writing/writing.store';

const renderWithRouter = (
  component: React.ReactElement,
  initialEntries = ['/']
) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
  );

describe('New Feature E2E: PR Review Coach on WorkTools', () => {
  it('PR Review Coach tab exists on WorkTools page', () => {
    renderWithRouter(<WorkToolsPage />, ['/tools/work']);
    expect(screen.getByText(/PR Review Coach/i)).toBeInTheDocument();
  });

  it('clicking PR Review Coach tab renders the coach component', async () => {
    renderWithRouter(<WorkToolsPage />, ['/tools/work']);

    const reviewCoachTab = screen.getByRole('tab', {
      name: /PR Review Coach/i,
    });

    fireEvent.click(reviewCoachTab);

    await waitFor(() => {
      expect(screen.getByText(/PR Review Polite Coach/i)).toBeInTheDocument();
    });
  });

  it('PR Review Coach shows textarea input', async () => {
    renderWithRouter(<WorkToolsPage />, ['/tools/work']);

    const reviewCoachTab = screen.getByRole('tab', {
      name: /PR Review Coach/i,
    });
    fireEvent.click(reviewCoachTab);

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Paste harsh review comment/i)
      ).toBeInTheDocument();
    });
  });

  it('PR Review Coach has sample buttons', async () => {
    renderWithRouter(<WorkToolsPage />, ['/tools/work']);

    const reviewCoachTab = screen.getByRole('tab', {
      name: /PR Review Coach/i,
    });
    fireEvent.click(reviewCoachTab);

    await waitFor(() => {
      expect(screen.getByText(/Sample 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Sample 2/i)).toBeInTheDocument();
    });
  });

  it('PR Review Coach has Make Polite button', async () => {
    renderWithRouter(<WorkToolsPage />, ['/tools/work']);

    const reviewCoachTab = screen.getByRole('tab', {
      name: /PR Review Coach/i,
    });
    fireEvent.click(reviewCoachTab);

    await waitFor(() => {
      expect(screen.getByText(/Make Polite/i)).toBeInTheDocument();
    });
  });

  it('PR Review Coach Make Polite button is disabled when input is empty', async () => {
    renderWithRouter(<WorkToolsPage />, ['/tools/work']);

    const reviewCoachTab = screen.getByRole('tab', {
      name: /PR Review Coach/i,
    });
    fireEvent.click(reviewCoachTab);

    await waitFor(() => {
      const politeButton = screen.getByText(/Make Polite/i).closest('button');
      expect(politeButton).toBeDisabled();
    });
  });

  it('clicking a sample populates the input', async () => {
    renderWithRouter(<WorkToolsPage />, ['/tools/work']);

    const reviewCoachTab = screen.getByRole('tab', {
      name: /PR Review Coach/i,
    });
    fireEvent.click(reviewCoachTab);

    await waitFor(() => {
      const sample1 = screen.getByText(/Sample 1/i);
      fireEvent.click(sample1);

      const textarea = screen.getByLabelText(/Paste harsh review comment/i);
      expect(textarea).toHaveValue(
        'This code is terrible. Why did you write it this way? Fix it now.'
      );
    });
  });
});

describe('New Feature E2E: Interview Simulator on Speaking', () => {
  beforeEach(() => {
    const completedMissions: Record<string, number> = {};
    for (let i = 0; i < 6; i++) completedMissions[`mission_${i}`] = 80;
    useReadingStore.setState({ completedMissions });
    useWritingStore.setState({ completedMissions });
  });

  it('Speaking page renders with Interview Simulator tab', () => {
    renderWithRouter(<SpeakingPage />, ['/speaking']);
    expect(screen.getByText(/Interview Simulator/i)).toBeInTheDocument();
  });

  it('Speaking page has Roleplay tab', () => {
    renderWithRouter(<SpeakingPage />, ['/speaking']);
    expect(screen.getByRole('tab', { name: /roleplay/i })).toBeInTheDocument();
  });

  it('clicking Interview Simulator tab renders the simulator', async () => {
    renderWithRouter(<SpeakingPage />, ['/speaking']);

    const interviewTab = screen.getByRole('tab', {
      name: /interview simulator/i,
    });
    fireEvent.click(interviewTab);

    await waitFor(() => {
      expect(
        screen.getByText(/Technical Interview Simulator/i)
      ).toBeInTheDocument();
    });
  });

  it('Interview Simulator shows System Design and Coding options', async () => {
    renderWithRouter(<SpeakingPage />, ['/speaking']);

    const interviewTab = screen.getByRole('tab', {
      name: /interview simulator/i,
    });
    fireEvent.click(interviewTab);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /System Design/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /Coding Interview/i })
      ).toBeInTheDocument();
    });
  });

  it('Interview Simulator shows description text', async () => {
    renderWithRouter(<SpeakingPage />, ['/speaking']);

    const interviewTab = screen.getByRole('tab', {
      name: /interview simulator/i,
    });
    fireEvent.click(interviewTab);

    await waitFor(() => {
      expect(
        screen.getByText(/Practice System Design and Coding interviews/i)
      ).toBeInTheDocument();
    });
  });

  it('Interview Simulator shows "Start practice" for each mode', async () => {
    renderWithRouter(<SpeakingPage />, ['/speaking']);

    const interviewTab = screen.getByRole('tab', {
      name: /interview simulator/i,
    });
    fireEvent.click(interviewTab);

    await waitFor(() => {
      const startButtons = screen.getAllByText(/Start practice/i);
      expect(startButtons.length).toBe(2);
    });
  });
});

describe('New Feature E2E: Team Dashboard on Team page', () => {
  it('Team page renders Team Management heading', async () => {
    renderWithRouter(<TeamPage />, ['/team']);
    await waitFor(() => {
      expect(
        screen.getAllByText('Team Management').length
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('Team page shows admin panel badge', async () => {
    renderWithRouter(<TeamPage />, ['/team']);
    await waitFor(() => {
      expect(screen.getByText(/Admin panel/i)).toBeInTheDocument();
    });
  });

  it('Team page shows team description', async () => {
    renderWithRouter(<TeamPage />, ['/team']);
    await waitFor(() => {
      expect(screen.getByText(/Assign training licenses/i)).toBeInTheDocument();
    });
  });

  it('Team page renders EntitlementGate', async () => {
    renderWithRouter(<TeamPage />, ['/team']);
    await waitFor(() => {
      expect(
        screen.getByText(/Team management requires the Project plan/i)
      ).toBeInTheDocument();
    });
  });
});
