import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { ToolsSidebar } from './ToolsSidebar';

vi.mock('@/features/learning-orchestrator/SkillEntryBrief', () => ({
  SkillEntryBrief: ({ skill }: { skill: string }) => <div>{skill}</div>,
}));

vi.mock('@/layouts/sidebar/SkillSidebar', () => ({
  SkillSidebar: ({ config }: { config: { pathLabel: string; tabs: { label: string }[] } }) => (
    <div>
      <span>{config.pathLabel}</span>
      {config.tabs.map((t: { label: string }) => (
        <span key={t.label}>{t.label}</span>
      ))}
    </div>
  ),
}));

describe('ToolsSidebar', () => {
  it('renders sidebar with Tools label and tabs', () => {
    render(
      <MemoryRouter>
        <ToolsSidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Work Tools')).toBeInTheDocument();
    expect(screen.getByText('Quick Tools')).toBeInTheDocument();
    expect(screen.getByText('AI Copilot')).toBeInTheDocument();
  });
});
