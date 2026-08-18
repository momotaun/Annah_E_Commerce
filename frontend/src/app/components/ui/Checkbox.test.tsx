import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('renders with a label', () => {
    render(<Checkbox id="remember" label="Remember Me" />);
    expect(screen.getByText('Remember Me')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<Checkbox id="remember" label="Remember Me" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('respects defaultChecked', () => {
    render(<Checkbox id="laptops" label="Laptops" defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange when clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox id="remember" label="Remember Me" onChange={handleChange} />);

    await user.click(screen.getByRole('checkbox'));

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('toggles when the label text is clicked, not just the box itself', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox id="remember" label="Remember Me" onChange={handleChange} />);

    await user.click(screen.getByText('Remember Me'));

    // Clicking the label should toggle the checkbox since it's wrapped in <label htmlFor>
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is set, and does not toggle on click', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox id="remember" label="Remember Me" disabled onChange={handleChange} />);

    expect(screen.getByRole('checkbox')).toBeDisabled();

    await user.click(screen.getByText('Remember Me'));
    expect(handleChange).not.toHaveBeenCalled();
  });
});