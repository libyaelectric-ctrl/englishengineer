import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const renderWithProviders = (component: React.ReactElement) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  );

// Lazy/Suspense-loaded components resolve slowly under a full multi-file
// CI run; give async utility assertions more headroom (see the matching
// configure() call in new-features.e2e.test.tsx).
configure({ asyncUtilTimeout: 10000 });

describe('Landing page E2E', () => {
  it('renders hero section with correct branding', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getAllByText(/Engineering English/i).length).toBeGreaterThan(0);
  });

  it('displays features', async () => {
    renderWithProviders(<LandingPage />);

    // Features are on slide 2 (index 2). Navigate via slide indicators.
    const nextButton = screen.getByRole('button', { name: /next slide/i });
    // Click next twice to go from slide 0 → 1 → 2 (features)
    fireEvent.click(nextButton);
    await waitFor(() => {});
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getAllByText(/vocabulary/i).length).toBeGreaterThan(0);
    });
  });
});
