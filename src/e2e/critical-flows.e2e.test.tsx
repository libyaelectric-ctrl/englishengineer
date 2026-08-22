import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import LandingPage from '@/pages/LandingPage';

vi.mock('@/pages/LandingPage/Navbar', () => ({
  Navbar: () => <nav data-testid="mock-navbar" />,
}));

vi.mock('@/pages/LandingPage/HeroScene', () => ({
  default: () => <div data-testid="mock-hero-scene" />,
}));

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
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getAllByText(/Engineering English/i).length).toBeGreaterThan(0);
  });

  it('shows skill features on landing', () => {
    renderWithProviders(<LandingPage />);
    // The slide features include vocabulary, grammar, etc.
    expect(screen.getAllByText(/vocabulary/i).length).toBeGreaterThan(0);
  });
});

describe('Critical flow: Vocabulary page', () => {
  it('renders vocabulary page without crashing', async () => {
    const { default: VocabularyPage } = await import('@/pages/VocabularyPage');
    renderWithProviders(<VocabularyPage />, ['/vocabulary']);
    await waitFor(() => {
      // Language-agnostic: page renders with at least one text node (any language)
      expect(screen.getAllByText(/vocabulary/i).length).toBeGreaterThan(0);
    });
  });

  it('shows search trigger', async () => {
    const { default: VocabularyPage } = await import('@/pages/VocabularyPage');
    renderWithProviders(<VocabularyPage />, ['/vocabulary']);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });
  });
});

describe('Critical flow: Curriculum page', () => {
  it('renders curriculum page without crashing', async () => {
    const { default: CurriculumPage } = await import('@/pages/CurriculumPage');
    renderWithProviders(<CurriculumPage />, ['/curriculum']);
    // Language-agnostic: check page rendered (has main content area)
    await waitFor(() => {
      expect(document.querySelector('main, [class*="space-y"]')).toBeTruthy();
    });
  });
});

describe('Critical flow: Grammar page', () => {
  it('renders grammar page without crashing', async () => {
    const { default: GrammarPage } = await import('@/pages/GrammarPage');
    renderWithProviders(<GrammarPage />, ['/grammar']);
    await waitFor(() => {
      expect(screen.getAllByText(/grammar/i).length).toBeGreaterThan(0);
    });
  });
});

describe('Critical flow: Pricing page', () => {
  it('renders pricing page with plan cards', async () => {
    const { default: PricingPage } = await import('@/pages/PricingPage');
    renderWithProviders(<PricingPage />, ['/pricing']);
    expect(screen.getAllByText(/Pricing/i).length).toBeGreaterThan(0);
  });
});
