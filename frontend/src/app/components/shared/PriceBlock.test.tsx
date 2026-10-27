import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceBlock from './PriceBlock';

describe('PriceBlock', () => {
  it('shows only the price when there is no markdown', () => {
    render(<PriceBlock price="149" />);
    expect(screen.getByText(/149/)).toBeInTheDocument();
    expect(screen.queryByText(/% off/)).not.toBeInTheDocument();
  });

  it('ignores a compare-at price that is not higher than the price', () => {
    render(<PriceBlock price="149" compareAtPrice="149" />);
    expect(screen.queryByText(/% off/)).not.toBeInTheDocument();
  });

  it('uses the orange sale badge below 60% off', () => {
    render(<PriceBlock price="75" compareAtPrice="100" />);
    expect(screen.getByText('25% off')).toHaveClass('bg-sale');
  });

  it('uses the red clearance badge at 60% off or more', () => {
    render(<PriceBlock price="40" compareAtPrice="100" />);
    expect(screen.getByText('60% off')).toHaveClass('bg-clearance');
  });
});
