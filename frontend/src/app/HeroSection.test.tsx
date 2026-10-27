import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroSection, { type Slide } from './HeroSection';

const slides: Slide[] = [
  {
    eyebrow: 'A Better Way To Shop',
    headlineBefore: 'Quality products for a',
    highlight: 'brighter',
    headlineAfter: 'everyday',
    subheading: 'Top brands. Great prices.',
    image: '/images/hero-desk.jpg',
    cta: { label: 'Shop Now', href: '/catalogue' },
    badgeValue: '50%',
    badgeCaption: 'Selected items',
  },
  {
    eyebrow: 'New Season',
    headlineBefore: 'Tailored style,',
    highlight: 'elevated',
    headlineAfter: 'everyday',
    subheading: 'Premium fashion essentials.',
    image: '/images/cat-fashion.jpg',
    cta: { label: 'Shop Fashion', href: '/categories/fashion' },
    badgeValue: '25%',
    badgeCaption: 'New arrivals',
  },
];

describe('HeroSection', () => {
  it('renders nothing when there are no slides', () => {
    const { container } = render(<HeroSection slides={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the first slide with its discount and call to action', () => {
    render(<HeroSection slides={slides} />);
    expect(screen.getByText('A Better Way To Shop')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shop now/i })).toHaveAttribute('href', '/catalogue');
  });

  it('switches slide when a dot is clicked', async () => {
    const user = userEvent.setup();
    render(<HeroSection slides={slides} />);
    await user.click(screen.getByRole('button', { name: 'Go to slide 2' }));
    expect(screen.getByText('New Season')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shop fashion/i })).toHaveAttribute('href', '/categories/fashion');
  });

  it('lists the value propositions, with Daily deals linking to the deals page', () => {
    render(<HeroSection slides={slides} />);
    expect(screen.getByText('Free shipping')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /daily deals/i })).toHaveAttribute(
      'href',
      '/collections/limited-edition'
    );
  });
});
