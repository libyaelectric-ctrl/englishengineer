import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReadingTranslation } from './ReadingTranslation';

describe('ReadingTranslation', () => {
  it('is hidden by default and revealable by interaction', () => {
    render(<ReadingTranslation translation="Türkçe çeviri" />);
    const translation = screen.getByTestId('reading-translation');
    expect(translation).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(
      screen.getByRole('button', { name: /Turkish translation/i })
    );
    expect(translation).toHaveAttribute('aria-hidden', 'false');
  });
});
