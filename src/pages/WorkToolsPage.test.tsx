import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import WorkToolsPage from './WorkToolsPage';

vi.mock('@/features/work-tools', () => ({
  ENGINEERING_TEMPLATES: [
    {
      id: 'tpl-1',
      title: 'Test Template',
      context: 'Test context',
      sampleInput: 'Input',
      professionalOutput: 'Output',
      turkishExplanation: 'Açıklama',
      category: 'Core',
      useCase: 'Testing',
      tone: 'Professional',
      tags: ['test'],
    },
  ],
  EMAIL_TEMPLATES: [],
  PHRASE_LIBRARY: [],
  WorkToolsService: { copy: vi.fn() },
  useWorkToolsStore: vi.fn(() => ({
    favoritePhraseIds: [],
    toggleFavorite: vi.fn(),
    remember: vi.fn(),
    sendToQuickAI: vi.fn(),
    quickAIDraft: null,
  })),
}));

vi.mock('@/features/beta', () => ({
  BetaService: { trackEvent: vi.fn() },
}));

vi.mock('@/shared/components/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('@/features/work-tools/components/PRReviewCoach', () => ({
  PRReviewCoach: () => <div>PR Review Coach</div>,
}));

vi.mock('@/features/writing/FieldDocAssistant', () => ({
  default: () => <div>Field Doc Assistant</div>,
}));

describe('WorkToolsPage', () => {
  const renderPage = (embedded = false) =>
    render(
      <MemoryRouter>
        <WorkToolsPage embedded={embedded} />
      </MemoryRouter>
    );

  it('renders Work Tools header when not embedded', () => {
    renderPage(false);
    expect(screen.getByText('Work Tools')).toBeInTheDocument();
  });

  it('hides header when embedded', () => {
    renderPage(true);
    expect(screen.queryByText('Work Tools')).not.toBeInTheDocument();
  });

  it('renders tab buttons for templates, emails, phrases', () => {
    renderPage();
    expect(screen.getByRole('tab', { name: /engineering templates/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /email templates/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /phrase library/i })).toBeInTheDocument();
  });

  it('displays template cards on default tab', () => {
    renderPage();
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });
});
