import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick} disabled>Click me</Button>);

    await user.click(screen.getByText('Click me'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as a link when href is provided, not a button', () => {
    render(<Button href="/catalogue">Shop Now</Button>);
    expect(screen.getByRole('link', { name: 'Shop Now' })).toHaveAttribute('href', '/catalogue');
  });

  it('shows a spinner and disables interaction when isLoading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('uses the lime brand colour with dark text for the primary variant', () => {
    render(<Button>Add to Cart</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-lime', 'text-ink');
  });

  it('supports dark, sale and clearance variants', () => {
    render(
      <>
        <Button variant="dark">Shop Now</Button>
        <Button variant="sale">Sale</Button>
        <Button variant="clearance">Clearance</Button>
      </>
    );
    expect(screen.getByText('Shop Now')).toHaveClass('bg-ink');
    expect(screen.getByText('Sale')).toHaveClass('bg-sale');
    expect(screen.getByText('Clearance')).toHaveClass('bg-clearance');
  });
});
