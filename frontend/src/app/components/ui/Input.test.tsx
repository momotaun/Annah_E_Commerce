import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  it('renders with a placeholder', () => {
    render(<Input placeholder="Email Address" />);
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
  });

  it('calls onChange when typed into', async () => {
    const user = userEvent.setup();
    let value = '';
    render(<Input value={value} onChange={(e) => (value = e.target.value)} />);

    await user.type(screen.getByRole('textbox'), 'hello');

    expect(value).toBe('o'); // onChange fires per keystroke; last event reflects the last char typed since we're not re-rendering with state here
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Input disabled placeholder="Disabled field" />);
    expect(screen.getByPlaceholderText('Disabled field')).toBeDisabled();
  });

  it('displays an error message when error prop is provided', () => {
    render(<Input error="Please enter a valid email address" />);
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('does not render an error message when no error is passed', () => {
    render(<Input placeholder="Clean field" />);
    expect(screen.queryByText(/./, { selector: '.text-danger-500' })).not.toBeInTheDocument();
  });

  describe('password toggle', () => {
    it('renders as type="password" by default for password inputs', () => {
      render(<Input type="password" aria-label="Password" />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('toggles to type="text" when the eye icon is clicked, and back again', async () => {
      const user = userEvent.setup();
      render(<Input type="password" aria-label="Password" />);

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');

      await user.click(screen.getByLabelText('Show password'));
      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

      await user.click(screen.getByLabelText('Hide password'));
      expect(input).toHaveAttribute('type', 'password');
    });

    it('does not render a toggle icon for non-password inputs', () => {
      render(<Input type="email" aria-label="Email" />);
      expect(screen.queryByLabelText(/show password|hide password/i)).not.toBeInTheDocument();
    });
  });
});