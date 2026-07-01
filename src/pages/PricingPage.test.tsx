import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PricingPage from './PricingPage';

describe('PricingPage', () => {
  it('keeps unverified checkout controls disabled while real navigation works', () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    const unavailableControls = screen.getAllByRole('button', {
      name: 'Billing unavailable',
    });

    expect(unavailableControls).toHaveLength(3);
    unavailableControls.forEach((control) => expect(control).toBeDisabled());
    expect(screen.getByRole('link', { name: 'Start free' })).toHaveAttribute(
      'href',
      '/start'
    );
    expect(screen.getByRole('link', { name: 'Explore Team' })).toHaveAttribute(
      'href',
      '/business'
    );
    expect(
      screen.getByRole('heading', {
        name: 'See what changes before choosing a plan.',
      })
    ).toBeVisible();
    expect(
      screen.getByText('5 module attempts and 25 vocabulary reviews/day')
    ).toBeVisible();
    expect(
      screen.getAllByText('Final paid limits pending verified launch')
    ).toHaveLength(3);
  });
});
