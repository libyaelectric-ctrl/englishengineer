import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CommandPalette } from '@/shared/components/CommandPalette';

const renderPalette = (initialEntries = ['/dashboard']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <CommandPalette />
    </MemoryRouter>
  );

describe('Command Palette E2E', () => {
  it('does not render when closed', () => {
    renderPalette();
    expect(
      screen.queryByRole('textbox', { name: /command palette search/i })
    ).not.toBeInTheDocument();
  });

  it('renders when Ctrl+K is pressed', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /command palette search/i })
      ).toBeInTheDocument();
    });
  });

  it('renders when Meta+K is pressed', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /command palette search/i })
      ).toBeInTheDocument();
    });
  });

  it('closes on Escape key', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /command palette search/i })
      ).toBeInTheDocument();
    });
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(
        screen.queryByRole('textbox', { name: /command palette search/i })
      ).not.toBeInTheDocument();
    });
  });

  it('shows search input with placeholder', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      const input = screen.getByRole('textbox', {
        name: /command palette search/i,
      });
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute(
        'placeholder',
        'Search pages, navigate, or run actions...'
      );
    });
  });

  it('displays all navigation categories', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByText('Navigate')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Tools')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
  });

  it('filters results when typing in search', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /command palette search/i })
      ).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', {
      name: /command palette search/i,
    });
    fireEvent.change(input, { target: { value: 'vocabulary' } });

    await waitFor(() => {
      expect(screen.getByText('Vocabulary')).toBeInTheDocument();
      // Other non-matching items should be filtered out
      expect(screen.queryByText('Writing')).not.toBeInTheDocument();
      expect(screen.queryByText('Listening')).not.toBeInTheDocument();
    });
  });

  it('shows all skills when searching for "skill" keyword', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /command palette search/i })
      ).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', {
      name: /command palette search/i,
    });
    fireEvent.change(input, { target: { value: 'speaking' } });

    await waitFor(() => {
      expect(screen.getByText('Speaking')).toBeInTheDocument();
    });
  });

  it('shows no results message for unmatched search', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /command palette search/i })
      ).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', {
      name: /command palette search/i,
    });
    fireEvent.change(input, {
      target: { value: 'xyznonexistent123' },
    });

    await waitFor(() => {
      expect(screen.getByText(/No results for/i)).toBeInTheDocument();
    });
  });

  it('navigates on select via click', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /command palette search/i })
      ).toBeInTheDocument();
    });

    const vocabularyItem = screen.getByText('Vocabulary');
    fireEvent.click(vocabularyItem);

    await waitFor(() => {
      // Palette should close after selection
      expect(
        screen.queryByRole('textbox', { name: /command palette search/i })
      ).not.toBeInTheDocument();
    });
  });

  it('navigates on Enter key press', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /command palette search/i })
      ).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', {
      name: /command palette search/i,
    });
    fireEvent.change(input, { target: { value: 'vocabulary' } });

    await waitFor(() => {
      expect(screen.getByText('Vocabulary')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(
        screen.queryByRole('textbox', { name: /command palette search/i })
      ).not.toBeInTheDocument();
    });
  });

  it('shows keyboard shortcuts in footer', async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByText('ESC')).toBeInTheDocument();
      expect(screen.getByText('navigate')).toBeInTheDocument();
      expect(screen.getByText('select')).toBeInTheDocument();
    });
  });

  it('toggles open/closed with repeated Ctrl+K', async () => {
    renderPalette();

    // Open
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /command palette search/i })
      ).toBeInTheDocument();
    });

    // Close
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.queryByRole('textbox', { name: /command palette search/i })
      ).not.toBeInTheDocument();
    });
  });
});
