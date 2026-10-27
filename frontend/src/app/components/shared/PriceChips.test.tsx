import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PriceChips from './PriceChips';

describe('PriceChips', () => {
  it('applies a price range when a chip is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PriceChips onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'R250 – R499' }));
    expect(onChange).toHaveBeenCalledWith(250, 499);
  });

  it('shows the active range as pressed and clears it when clicked again', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PriceChips minPrice={100} maxPrice={249} onChange={onChange} />);
    const chip = screen.getByRole('button', { name: 'R100 – R249' });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    await user.click(chip);
    expect(onChange).toHaveBeenCalledWith(0, 50000);
  });
});
