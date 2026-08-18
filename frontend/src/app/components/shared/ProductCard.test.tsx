import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';

const baseProps = {
  href: '/products/test-product',
  image: '/images/test.jpg',
  title: 'Apex ProBook M3 Max',
  price: 'R45,999',
};

describe('ProductCard', () => {
  it('renders the title, price, and links to the product page', () => {
    render(<ProductCard {...baseProps} />);

    expect(screen.getByText('Apex ProBook M3 Max')).toBeInTheDocument();
    expect(screen.getByText('R45,999')).toBeInTheDocument();

    // Both the image and the title text are separately wrapped in a link to
    // the product — both share the same accessible name, so assert on all.
    const links = screen.getAllByRole('link', { name: 'Apex ProBook M3 Max' });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link).toHaveAttribute('href', '/products/test-product'));
  });

  it('does not render a category label when none is provided', () => {
    render(<ProductCard {...baseProps} />);
    // Category renders as a small uppercase span above the title — confirm
    // no stray empty element when the optional prop is omitted.
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('renders the category label when provided', () => {
    render(<ProductCard {...baseProps} category="Laptops" />);
    expect(screen.getByText('Laptops')).toBeInTheDocument();
  });

  it('renders a badge when provided', () => {
    render(<ProductCard {...baseProps} badge={{ label: 'Best Seller', variant: 'primary' }} />);
    expect(screen.getByText('Best Seller')).toBeInTheDocument();
  });

  it('does not render a wishlist button unless showWishlist is true', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.queryByLabelText('Add to wishlist')).not.toBeInTheDocument();
  });

  it('renders and wires up the wishlist button when showWishlist is true', async () => {
    const handleToggle = vi.fn();
    const user = userEvent.setup();
    render(<ProductCard {...baseProps} showWishlist onToggleWishlist={handleToggle} />);

    await user.click(screen.getByLabelText('Add to wishlist'));

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('does not render an Add to Cart button unless onAddToCart is provided', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.queryByLabelText('Add to cart')).not.toBeInTheDocument();
  });

  it('calls onAddToCart when the cart button is clicked', async () => {
    const handleAddToCart = vi.fn();
    const user = userEvent.setup();
    render(<ProductCard {...baseProps} onAddToCart={handleAddToCart} />);

    await user.click(screen.getByLabelText('Add to cart'));

    expect(handleAddToCart).toHaveBeenCalledTimes(1);
  });

  it('renders RatingStars only when a rating is provided', () => {
    const { rerender } = render(<ProductCard {...baseProps} />);
    expect(screen.queryByText(/^\d\.\d$/)).not.toBeInTheDocument();

    rerender(<ProductCard {...baseProps} rating={4.9} reviewCount={124} />);
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('(124)')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<ProductCard {...baseProps} description="A great laptop for professionals." />);
    expect(screen.getByText('A great laptop for professionals.')).toBeInTheDocument();
  });
});