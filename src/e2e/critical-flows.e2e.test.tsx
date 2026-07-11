import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) =>
  render(<MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>);

describe('Critical flow: Landing → Navigation', () => {
  it('renders landing page with hero and navigation', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/Engineering English OS/)).toBeInTheDocument();
    expect(screen.getAllByText(/Start free/i).length).toBeGreaterThan(0);
  });

  it('displays pricing section with all plans', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
    expect(screen.getByText('$19')).toBeInTheDocument();
    expect(screen.getByText('$39')).toBeInTheDocument();
  });

  it('shows 6 skill features on landing', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/Writing desk/i)).toBeInTheDocument();
    expect(screen.getByText(/Speaking room/i)).toBeInTheDocument();
    expect(screen.getByText(/Listening lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Reading vault/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress control/i)).toBeInTheDocument();
  });
});

describe('Critical flow: Vocabulary page', () => {
  it('renders vocabulary page without crashing', async () => {
    const { default: VocabularyPage } = await import('@/pages/VocabularyPage');
    renderWithRouter(<VocabularyPage />);
    expect(screen.getAllByText(/Vocabulary/i).length).toBeGreaterThan(0);
  });

  it('shows search input', async () => {
    const { default: VocabularyPage } = await import('@/pages/VocabularyPage');
    renderWithRouter(<VocabularyPage />);
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });
});

describe('Critical flow: Curriculum page', () => {
  it('renders curriculum page without crashing', async () => {
    const { default: CurriculumPage } = await import('@/pages/CurriculumPage');
    renderWithRouter(<CurriculumPage />, ['/curriculum']);
    expect(screen.getByText(/Learning Hub/i)).toBeInTheDocument();
  });
});

describe('Critical flow: Grammar page', () => {
  it('renders grammar page without crashing', async () => {
    const { default: GrammarPage } = await import('@/pages/GrammarPage');
    renderWithRouter(<GrammarPage />, ['/grammar']);
    expect(screen.getAllByText(/Grammar/i).length).toBeGreaterThan(0);
  });
});

describe('Critical flow: Pricing page', () => {
  it('renders pricing page with plan cards', async () => {
    const { default: PricingPage } = await import('@/pages/PricingPage');
    renderWithRouter(<PricingPage />, ['/pricing']);
    expect(screen.getByText(/Pricing/i)).toBeInTheDocument();
  });
});
