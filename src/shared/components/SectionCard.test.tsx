import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionCard } from './SectionCard';

describe('SectionCard', () => {
  it('renders title', () => {
    render(<SectionCard title="Grammar Rules" />);
    expect(screen.getByText('Grammar Rules')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    render(<SectionCard title="Progress" subtitle="Your learning stats" />);
    expect(screen.getByText('Your learning stats')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <SectionCard title="Card">
        <p>Card content here</p>
      </SectionCard>
    );
    expect(screen.getByText('Card content here')).toBeTruthy();
  });

  it('renders headerActions when provided', () => {
    render(
      <SectionCard title="Actions" headerActions={<button>Action</button>} />
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeTruthy();
  });

  it('renders footer when provided', () => {
    render(
      <SectionCard title="Footer" footer={<span>Footer text</span>} />
    );
    expect(screen.getByText('Footer text')).toBeTruthy();
  });
});
