import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import LandingPage from '@/pages/LandingPage';

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithProviders = (component: React.ReactElement) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  );

describe('Landing page E2E', () => {
  it('renders hero section with correct branding', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getAllByText(/Engineering English/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Engineering Disciplines/i).length).toBeGreaterThan(0);
  });

  it('displays all 6 features', async () => {
    renderWithProviders(<LandingPage />);

    // Features are on slide 2 (index 2). Navigate via slide indicators.
    const nextButton = screen.getByRole('button', { name: /next slide/i });
    // Click next twice to go from slide 0 → 1 → 2 (features)
    fireEvent.click(nextButton);
    await waitFor(() => {});
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getAllByText(/vocabulary/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/writing/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/speaking/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/listening/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/reading/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/grammar/i).length).toBeGreaterThan(0);
    });
  });
});
