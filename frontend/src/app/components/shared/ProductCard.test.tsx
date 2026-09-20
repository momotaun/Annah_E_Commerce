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

  it('does not render an Add to Cart button unless onQuantityChange is provided', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.queryByLabelText('Add to cart')).not.toBeInTheDocument();
  });

  it('shows a plain Add to Cart button until quantity is at least 1', async () => {
    const handleQuantityChange = vi.fn();
    const user = userEvent.setup();
    render(<ProductCard {...baseProps} quantity={0} onQuantityChange={handleQuantityChange} />);

    expect(screen.queryByLabelText('Increase quantity')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Add to cart'));

    expect(handleQuantityChange).toHaveBeenCalledTimes(1);
    expect(handleQuantityChange).toHaveBeenCalledWith(1);
  });

  it('swaps to a quantity selector once quantity is at least 1', async () => {
    const handleQuantityChange = vi.fn();
    const user = userEvent.setup();
    render(<ProductCard {...baseProps} quantity={2} onQuantityChange={handleQuantityChange} />);

    expect(screen.queryByLabelText('Add to cart')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Increase quantity'));

    expect(handleQuantityChange).toHaveBeenCalledWith(3);
  });

  it('falls back to a stable mock rating when none is provided', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText(/^\d\.\d$/)).toBeInTheDocument();
  });

  it('renders the exact rating and review count when provided', () => {
    render(<ProductCard {...baseProps} rating={4.9} reviewCount={124} />);
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('(124)')).toBeInTheDocument();
  });

  it('renders a link to the vendor storefront when a vendor is provided', () => {
    render(
      <ProductCard {...baseProps} vendor={{ id: 'vendor-1', businessName: 'Meridian Apparel Co.' }} />
    );

    const link = screen.getByRole('link', { name: 'by Meridian Apparel Co.' });
    expect(link).toHaveAttribute('href', '/vendors/vendor-1');
  });

  it('renders no vendor line for marketplace-owned products (vendor null or omitted)', () => {
    const { rerender } = render(<ProductCard {...baseProps} />);
    expect(screen.queryByText(/^by /)).not.toBeInTheDocument();

    rerender(<ProductCard {...baseProps} vendor={null} />);
    expect(screen.queryByText(/^by /)).not.toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<ProductCard {...baseProps} description="A great laptop for professionals." />);
    expect(screen.getByText('A great laptop for professionals.')).toBeInTheDocument();
  });
});