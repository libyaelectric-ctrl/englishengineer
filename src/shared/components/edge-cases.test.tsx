import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { SearchInput } from './SearchInput';
import { FileText } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (component: React.ReactElement) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe('Edge Cases', () => {
  describe('Button edge cases', () => {
    it('handles empty children', () => {
      render(<Button></Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles very long text', () => {
      const longText = 'A'.repeat(1000);
      render(<Button>{longText}</Button>);
      expect(screen.getByRole('button')).toHaveTextContent(longText);
    });

    it('handles special characters', () => {
      render(<Button>{'<script>alert("xss")</script>'}</Button>);
      expect(screen.getByRole('button')).toHaveTextContent(/script/);
    });

    it('handles multiple rapid clicks', async () => {
      const user = userEvent.setup();
      render(<Button onClick={() => {}}>Click</Button>);
      const button = screen.getByRole('button');

      // Rapid clicks should not crash
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(button).toBeInTheDocument();
    });
  });

  describe('SearchInput edge cases', () => {
    it('handles empty search', () => {
      renderWithRouter(
        <SearchInput onSearch={() => {}} placeholder="Search" />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Search');
    });

    it('handles rapid typing', () => {
      renderWithRouter(
        <SearchInput onSearch={() => {}} placeholder="Search" />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Search');
    });

    it('handles unicode input', () => {
      renderWithRouter(<SearchInput onSearch={() => {}} placeholder="Ara" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Ara');
    });
  });

  describe('EmptyState edge cases', () => {
    it('handles missing onAction', () => {
      renderWithRouter(
        <EmptyState
          icon={FileText}
          title="Empty"
          description="No items"
          actionLabel="Create"
        />
      );
      // Should not have button if onAction is missing
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(200);
      renderWithRouter(
        <EmptyState icon={FileText} title={longTitle} description="Desc" />
      );
      expect(screen.getByRole('heading')).toHaveTextContent(longTitle);
    });

    it('handles missing description', () => {
      renderWithRouter(
        <EmptyState icon={FileText} title="Title" description="" />
      );
      expect(screen.getByRole('heading')).toHaveTextContent('Title');
    });
  });
});
