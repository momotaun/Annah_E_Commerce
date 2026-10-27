import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewToggle from './ViewToggle';

describe('ViewToggle', () => {
  it('marks the current view as pressed', () => {
    render(<ViewToggle value="list" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports the chosen view', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="grid" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'List view' }));
    expect(onChange).toHaveBeenCalledWith('list');
  });
});
