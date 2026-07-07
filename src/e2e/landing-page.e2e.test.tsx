import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';

describe('Landing page E2E', () => {
  it('renders hero section with correct branding', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Master the emails/)).toBeInTheDocument();
    expect(screen.getAllByText('Start Free').length).toBeGreaterThan(0);
    expect(screen.getByText('See Features')).toBeInTheDocument();
  });

  it('displays all 6 features', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Writing')).toBeInTheDocument();
    expect(screen.getByText('Speaking')).toBeInTheDocument();
    expect(screen.getByText('Listening')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('AI Coach')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
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

describe('Pricing page E2E', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Compare plans')).toBeInTheDocument();
  });
});
