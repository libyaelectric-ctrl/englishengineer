import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { BetaFeedbackWidget } from './BetaFeedbackWidget';

const renderWidget = () =>
  render(
    <MemoryRouter>
      <BetaFeedbackWidget />
    </MemoryRouter>
  );

describe('BetaFeedbackWidget', () => {
  beforeEach(() => localStorage.clear());

  it('opens and closes with Cancel', () => {
    renderWidget();
    fireEvent.click(
      screen.getByRole('button', { name: /open closed beta feedback/i })
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes with the X button and Escape', () => {
    renderWidget();
    const open = () =>
      fireEvent.click(
        screen.getByRole('button', { name: /open closed beta feedback/i })
      );
    open();
    fireEvent.click(
      screen.getByRole('button', { name: /close feedback form/i })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    open();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes after a valid submission', () => {
    renderWidget();
    fireEvent.click(
      screen.getByRole('button', { name: /open closed beta feedback/i })
    );
    fireEvent.change(screen.getByLabelText(/feedback message/i), {
      target: { value: 'The task flow is clear.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
