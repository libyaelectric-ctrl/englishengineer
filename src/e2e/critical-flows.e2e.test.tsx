import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import LandingPage from '@/pages/LandingPage';

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithProviders = (component: React.ReactElement, initialEntries = ['/']) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
    </QueryClientProvider>
  );

describe('Critical flow: Landing → Navigation', () => {
  it('renders landing page with hero and navigation', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getAllByText(/engineering career/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Start free/i).length).toBeGreaterThan(0);
  });

  it('displays pricing section with all plans', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getAllByText(/Free/i).length).toBeGreaterThan(0);
    expect(screen.getByText('$29')).toBeInTheDocument();
    expect(screen.getByText('$59')).toBeInTheDocument();
  });

  it('shows 6 skill features on landing', () => {
    renderWithProviders(<LandingPage />);
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
    renderWithProviders(<VocabularyPage />);
    expect(screen.getAllByText(/Vocabulary/i).length).toBeGreaterThan(0);
  });

  it('shows search trigger', async () => {
    const { default: VocabularyPage } = await import('@/pages/VocabularyPage');
    renderWithProviders(<VocabularyPage />);
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
  });
});

describe('Critical flow: Curriculum page', () => {
  it('renders curriculum page without crashing', async () => {
    const { default: CurriculumPage } = await import('@/pages/CurriculumPage');
    renderWithProviders(<CurriculumPage />, ['/curriculum']);
    expect(screen.getByText(/Learning Hub/i)).toBeInTheDocument();
  });
});

describe('Critical flow: Grammar page', () => {
  it('renders grammar page without crashing', async () => {
    const { default: GrammarPage } = await import('@/pages/GrammarPage');
    renderWithProviders(<GrammarPage />, ['/grammar']);
    expect(screen.getAllByText(/Grammar/i).length).toBeGreaterThan(0);
  });
});

describe('Critical flow: Pricing page', () => {
  it('renders pricing page with plan cards', async () => {
    const { default: PricingPage } = await import('@/pages/PricingPage');
    renderWithProviders(<PricingPage />, ['/pricing']);
    expect(screen.getAllByText(/Pricing/i).length).toBeGreaterThan(0);
  });
});
