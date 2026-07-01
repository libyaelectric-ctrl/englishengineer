import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScoreFeedbackOverlay } from './ScoreFeedbackOverlay';

describe('ScoreFeedbackOverlay light result UI', () => {
  it('renders a readable light result panel with a close action', () => {
    const close = vi.fn();
    render(
      <ScoreFeedbackOverlay
        result={{
          score: 82,
          xp: 40,
          coins: 8,
          eloChange: 12,
          strengths: ['Clear structure'],
          weaknesses: ['Use more target terms'],
          feedback: 'Good professional response.',
        }}
        onClose={close}
      />
    );
    const panel = screen.getByTestId('speaking-result-panel');
    expect(panel.className).toContain('bg-white');
    expect(panel.className).not.toMatch(/bg-(black|slate-9)/);
    expect(screen.getByText('82')).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: /dismiss diagnostics/i })
    );
    expect(close).toHaveBeenCalledOnce();
  });
});
