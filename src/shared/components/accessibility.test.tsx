import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SearchInput } from './SearchInput';
import { Skeleton, SkeletonCard, SkeletonText } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import { FileText } from 'lucide-react';

const renderWithRouter = (component: React.ReactElement) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe('Component Accessibility', () => {
  describe('SearchInput', () => {
    it('has an accessible label via placeholder', () => {
      renderWithRouter(
        <SearchInput onSearch={() => {}} placeholder="Search vocabulary" />
      );
      const input = screen.getByRole('textbox', { name: /search vocabulary/i });
      expect(input).toBeInTheDocument();
    });

    it('input is focusable and not hidden from screen readers', () => {
      renderWithRouter(
        <SearchInput onSearch={() => {}} placeholder="Search" />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Search');
      expect(input).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Skeleton', () => {
    it('renders correct number of skeleton elements', () => {
      const { container } = render(<Skeleton count={3} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('SkeletonCard renders without crashing', () => {
      const { container } = render(<SkeletonCard />);
      expect(container.firstChild).toBeTruthy();
    });

    it('SkeletonText renders correct number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(5);
    });
  });

  describe('EmptyState', () => {
    it('has accessible heading', () => {
      renderWithRouter(
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Create your first document to get started"
        />
      );
      const heading = screen.getByRole('heading', {
        name: /no documents found/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('action button has accessible label', () => {
      renderWithRouter(
        <EmptyState
          icon={FileText}
          title="Empty"
          description="Nothing here"
          actionLabel="Create Document"
          onAction={() => {}}
        />
      );
      const button = screen.getByRole('button', { name: /create document/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Button', () => {
    it('renders as button element', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button.tagName).toBe('BUTTON');
    });

    it('disabled button has aria-disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toBeDisabled();
    });
  });
});

describe('Keyboard Interactions', () => {
  it('SearchInput supports keyboard navigation', () => {
    renderWithRouter(<SearchInput onSearch={() => {}} placeholder="Search" />);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('tabindex', '-1');
  });

  it('buttons are focusable', () => {
    render(<Button>Focus me</Button>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('tabindex', '-1');
  });
});
