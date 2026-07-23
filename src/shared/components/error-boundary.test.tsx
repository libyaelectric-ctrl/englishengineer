import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PageErrorBoundary } from './PageErrorBoundary';

const ThrowingComponent = () => {
  throw new Error('Test error message');
};

const GoodComponent = () => <div>Working content</div>;

const renderWithRouter = (component: React.ReactElement) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe('PageErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    renderWithRouter(
      <PageErrorBoundary pageName="Test Page">
        <GoodComponent />
      </PageErrorBoundary>
    );
    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('shows page name in error title when error occurs', () => {
    // Suppress console.error for expected error
    const consoleSpy = console.error;
    console.error = () => {};

    renderWithRouter(
      <PageErrorBoundary pageName="Dashboard">
        <ThrowingComponent />
      </PageErrorBoundary>
    );

    expect(screen.getByText(/Dashboard Failed to Load/)).toBeInTheDocument();

    console.error = consoleSpy;
  });

  it('shows error message in fallback', () => {
    const consoleSpy = console.error;
    console.error = () => {};

    renderWithRouter(
      <PageErrorBoundary pageName="Test">
        <ThrowingComponent />
      </PageErrorBoundary>
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();

    console.error = consoleSpy;
  });

  it('provides Try Again button', () => {
    const consoleSpy = console.error;
    console.error = () => {};

    renderWithRouter(
      <PageErrorBoundary pageName="Test">
        <ThrowingComponent />
      </PageErrorBoundary>
    );

    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();

    console.error = consoleSpy;
  });

  it('provides Go Back button', () => {
    const consoleSpy = console.error;
    console.error = () => {};

    renderWithRouter(
      <PageErrorBoundary pageName="Test">
        <ThrowingComponent />
      </PageErrorBoundary>
    );

    expect(
      screen.getByRole('button', { name: /go back/i })
    ).toBeInTheDocument();

    console.error = consoleSpy;
  });
});
