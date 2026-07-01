import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WritingModelAnswer } from './WritingModelAnswer';

describe('WritingModelAnswer', () => {
  it('appears only after the user submits a response', () => {
    const { rerender } = render(
      <WritingModelAnswer hasSubmitted={false} modelAnswer="Target response" />
    );
    expect(screen.queryByText('Target response')).not.toBeInTheDocument();
    rerender(<WritingModelAnswer hasSubmitted modelAnswer="Target response" />);
    expect(screen.getByText('Target response')).toBeVisible();
  });
});
