import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import ToolsPage from './ToolsPage';

describe('ToolsPage', () => {
  beforeEach(() => localStorage.clear());

  it('merges Work Tools and Quick Tools into one tabbed workspace', () => {
    render(
      <MemoryRouter initialEntries={['/tools']}>
        <ToolsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'AI Copilot' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Work Tools' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Quick Tools' }));
    expect(screen.getByRole('tab', { name: 'Quick AI' })).toBeInTheDocument();
  });
});
