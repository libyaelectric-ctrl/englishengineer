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
    expect(screen.getAllByText(/Built for Engineers/i).length).toBeGreaterThan(0);
  });

  it('displays all 6 features', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByText(/Writing desk/i)).toBeInTheDocument();
    expect(screen.getByText(/Speaking room/i)).toBeInTheDocument();
    expect(screen.getByText(/Listening lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Reading vault/i)).toBeInTheDocument();
    expect(screen.getAllByText(/AI coach/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Progress control/i)).toBeInTheDocument();
  });

  it('shows 3 pricing plans on landing', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getAllByText(/Free/i).length).toBeGreaterThan(0);
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getAllByText('$29').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$59').length).toBeGreaterThan(0);
  });

  it('FAQ items are clickable', async () => {
    renderWithProviders(<LandingPage />);

    const faqButton = screen.getByText(/Is there a free plan/i);
    expect(faqButton).toBeInTheDocument();
    fireEvent.click(faqButton);
    await waitFor(() => {
      expect(screen.getByText(/includes core learning modules/i)).toBeInTheDocument();
    });
  });
});
