import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';

describe('Landing page E2E', () => {
  it('renders hero section with correct branding', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Engineering English OS/)).toBeInTheDocument();
    expect(screen.getAllByText(/Start free/i).length).toBeGreaterThan(0);
  });

  it('displays all 6 features', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Writing desk/i)).toBeInTheDocument();
    expect(screen.getByText(/Speaking room/i)).toBeInTheDocument();
    expect(screen.getByText(/Listening lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Reading vault/i)).toBeInTheDocument();
    expect(screen.getAllByText(/AI coach/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Progress control/i)).toBeInTheDocument();
  });

  it('shows 3 pricing plans on landing', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$19')).toBeInTheDocument();
    expect(screen.getByText('$39')).toBeInTheDocument();
  });

  it('FAQ items are clickable', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const faqButton = screen.getByText('What is EngVox?');
    expect(faqButton).toBeInTheDocument();
    faqButton.click();
    expect(screen.getAllByText(/AI-powered/).length).toBeGreaterThan(0);
  });
});
