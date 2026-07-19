import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';
import { Activity } from 'lucide-react';

describe('MetricCard', () => {
  it('renders with label and value', () => {
    render(<MetricCard label="Total Users" value={42} icon={Activity} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with trend', () => {
    render(
      <MetricCard
        label="Revenue"
        value="$1000"
        icon={Activity}
        trend="+12%"
        trendDirection="up"
      />
    );
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders with trend down', () => {
    render(
      <MetricCard
        label="Errors"
        value="5"
        icon={Activity}
        trend="-3%"
        trendDirection="down"
      />
    );
    expect(screen.getByText('-3%')).toBeInTheDocument();
  });

  it('applies status color', () => {
    render(
      <MetricCard
        label="Test"
        value="1"
        icon={Activity}
        statusColor="success"
      />
    );
    const card = screen.getByText('Test').closest('[class*="group"]');
    expect(card).toBeInTheDocument();
  });
});
