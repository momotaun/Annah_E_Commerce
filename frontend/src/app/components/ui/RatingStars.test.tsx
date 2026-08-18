import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RatingStars from './RatingStars';

describe('RatingStars', () => {
  it('displays the numeric rating value by default', () => {
    render(<RatingStars rating={4.9} />);
    expect(screen.getByText('4.9')).toBeInTheDocument();
  });

  it('displays the review count in parentheses when provided', () => {
    render(<RatingStars rating={4.9} reviewCount={124} />);
    expect(screen.getByText('(124)')).toBeInTheDocument();
  });

  it('hides the numeric value when showValue is false', () => {
    render(<RatingStars rating={4.9} showValue={false} />);
    expect(screen.queryByText('4.9')).not.toBeInTheDocument();
  });

  it('hides the count when showCount is false, even if reviewCount is provided', () => {
    render(<RatingStars rating={4.9} reviewCount={124} showCount={false} />);
    expect(screen.queryByText('(124)')).not.toBeInTheDocument();
  });

  it('does not show a count when reviewCount is undefined, regardless of showCount', () => {
    render(<RatingStars rating={4.9} showCount />);
    expect(screen.queryByText(/^\(/)).not.toBeInTheDocument();
  });

  it('rounds the rating to the nearest whole star for fill purposes', () => {
    const { container } = render(<RatingStars rating={4.6} showValue={false} showCount={false} />);
    // 4.6 rounds to 5 — all 5 stars should carry the filled class
    const filledStars = container.querySelectorAll('.fill-warning-500');
    expect(filledStars).toHaveLength(5);
  });

  it('renders exactly 5 stars regardless of rating value', () => {
    const { container } = render(<RatingStars rating={2.1} showValue={false} showCount={false} />);
    const allStars = container.querySelectorAll('svg');
    expect(allStars).toHaveLength(5);
  });
});