import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';

describe('Edge Cases', () => {
  describe('Button edge cases', () => {
    it('handles empty children', () => {
      render(<Button></Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles very long text', () => {
      const longText = 'A'.repeat(1000);
      render(<Button>{longText}</Button>);
      expect(screen.getByRole('button')).toHaveTextContent(longText);
    });

    it('handles special characters', () => {
      render(<Button>{'<script>alert("xss")</script>'}</Button>);
      expect(screen.getByRole('button')).toHaveTextContent(/script/);
    });

    it('handles multiple rapid clicks', async () => {
      const user = userEvent.setup();
      render(<Button onClick={() => {}}>Click</Button>);
      const button = screen.getByRole('button');

      // Rapid clicks should not crash
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(button).toBeInTheDocument();
    });
  });
});
