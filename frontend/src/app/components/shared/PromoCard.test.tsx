import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PromoCard from './PromoCard';

describe('PromoCard', () => {
  it('renders the eyebrow, headline and a link to the target page', () => {
    render(
      <PromoCard
        eyebrow="Fashion deals"
        headline={<>Up to <PromoCard.Accent>70% off</PromoCard.Accent></>}
        cta={{ label: 'Shop Fashion', href: '/categories/fashion' }}
        image="/images/cat-fashion.jpg"
      />
    );
    expect(screen.getByText('Fashion deals')).toBeInTheDocument();
    expect(screen.getByText('70% off')).toHaveClass('text-sale');
    expect(screen.getByRole('link', { name: /shop fashion/i })).toHaveAttribute('href', '/categories/fashion');
  });
});
