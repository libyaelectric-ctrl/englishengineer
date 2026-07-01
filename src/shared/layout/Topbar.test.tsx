import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Topbar } from './Topbar';

describe('Topbar', () => {
  it('does not render the non-functional global search', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/search missions, reports, vocabulary/i)
    ).not.toBeInTheDocument();
  });

  it('opens a useful workspace status panel from the notification control', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    );

    const notificationButton = screen.getByRole('button', {
      name: 'View system notifications',
    });
    fireEvent.click(notificationButton);

    expect(notificationButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Workspace status')).toBeInTheDocument();
    expect(screen.getByText('Learning queue is ready')).toBeInTheDocument();
  });
});
