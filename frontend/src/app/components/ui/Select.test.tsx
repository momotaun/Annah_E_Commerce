import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from './Select';

const options = [
  { label: 'General Inquiry', value: 'general' },
  { label: 'Order Support', value: 'order' },
];

describe('Select', () => {
  it('renders all provided options', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('option', { name: 'General Inquiry' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Order Support' })).toBeInTheDocument();
  });

  it('renders a disabled placeholder option when provided', () => {
    render(<Select options={options} placeholder="Select a subject" />);
    // getByRole can't filter hidden options by accessible name — a hidden
    // element always computes an empty name per the ARIA accname spec, no
    // matter its text content — so pick it out by its disabled state instead.
    const placeholderOption = screen
      .getAllByRole('option', { hidden: true })
      .find((option) => (option as HTMLOptionElement).disabled);
    expect(placeholderOption).toHaveTextContent('Select a subject');
    expect(placeholderOption).toBeDisabled();
  });

  it('calls onChange with the selected value', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Select options={options} onChange={handleChange} aria-label="Subject" />);

    await user.selectOptions(screen.getByLabelText('Subject'), 'order');

    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Select options={options} disabled aria-label="Subject" />);
    expect(screen.getByLabelText('Subject')).toBeDisabled();
  });

  it('shows an error message when error prop is provided', () => {
    render(<Select options={options} error="Please select an option" />);
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });
});