import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>-72%</Badge>);
    expect(screen.getByText('-72%')).toBeInTheDocument();
  });

  it('applies the discount variant used for percent-off badges', () => {
    render(<Badge variant="discount">-72%</Badge>);
    const badge = screen.getByText('-72%');
    expect(badge).toHaveClass('bg-clearance', 'text-white');
  });

  it('applies the lime variant with dark text', () => {
    render(<Badge variant="lime">New</Badge>);
    expect(screen.getByText('New')).toHaveClass('bg-brand-lime', 'text-ink');
  });
});
