import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyLevelState } from './LevelContentFilter';

describe('EmptyLevelState', () => {
  it('clearly reports an empty current-level view', () => {
    render(<EmptyLevelState skill="Listening" />);
    expect(screen.getByText('No current-level content yet')).toBeVisible();
    expect(
      screen.getByText(/No Listening content is available/i)
    ).toBeVisible();
  });
});
