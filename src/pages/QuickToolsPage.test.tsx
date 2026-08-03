import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import QuickToolsPage from './QuickToolsPage/index';

vi.mock('@/features/ai', () => ({
  AIService: { getStatus: () => ({ label: 'Mocked', isConnected: false }) },
}));

vi.mock('@/features/tools/PdfSpecExtractor', () => ({
  PdfSpecExtractor: () => <div>PDF Spec Extractor</div>,
}));

vi.mock('@/features/work-tools', () => ({
  useWorkToolsStore: vi.fn(() => ({ quickAIDraft: null })),
  MEETING_PHRASES: [],
  SITE_DICTIONARY: [],
  QUICK_AI_ACTIONS: [],
}));

vi.mock('@/shared/components/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('@/pages/QuickToolsPage/QuickAITab', () => ({
  QuickAITab: () => <div>Quick AI Tab</div>,
}));

vi.mock('@/pages/QuickToolsPage/MeetingPhrasebookTab', () => ({
  MeetingPhrasebookTab: () => <div>Meeting Phrasebook Tab</div>,
}));

vi.mock('@/pages/QuickToolsPage/SiteDictionaryTab', () => ({
  SiteDictionaryTab: () => <div>Site Dictionary Tab</div>,
}));

describe('QuickToolsPage', () => {
  const renderPage = (embedded = false) =>
    render(
      <MemoryRouter>
        <QuickToolsPage embedded={embedded} />
      </MemoryRouter>
    );

  it('renders header when not embedded', () => {
    renderPage(false);
    expect(screen.getByText('Quick Tools')).toBeInTheDocument();
  });

  it('hides header when embedded', () => {
    renderPage(true);
    expect(screen.queryByText('Quick Tools')).not.toBeInTheDocument();
  });

  it('renders tab buttons', () => {
    renderPage();
    expect(screen.getByRole('tab', { name: /quick ai/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /meeting phrasebook/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /site dictionary/i })).toBeInTheDocument();
  });

  it('renders default AI tab content', () => {
    renderPage();
    expect(screen.getByText('Quick AI Tab')).toBeInTheDocument();
  });
});
