import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import * as authApi from '@/src/lib/api/auth';
import { tokenStore } from '@/src/lib/api-client';

vi.mock('@/src/lib/api/auth');

function TestConsumer() {
  const { user, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'ready'}</span>
      <span data-testid="user">{user?.email ?? 'no-user'}</span>
      <button onClick={() => login('jane@example.co.za', 'password123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    tokenStore.setAccessToken(null);
  });

  it('starts logged out with no stored tokens', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('restores the user on mount if a valid access token is stored', async () => {
    localStorage.setItem('apex_access_token', 'stored-token');
    vi.mocked(authApi.getMe).mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.co.za',
      firstName: 'Jane',
      lastName: 'Dlamini',
      role: 'CUSTOMER',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('jane@example.co.za'));
  });

  it('clears stale tokens if restoring the session fails', async () => {
    localStorage.setItem('apex_access_token', 'expired-token');
    localStorage.setItem('apex_refresh_token', 'expired-refresh');
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('401'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(localStorage.getItem('apex_access_token')).toBeNull();
    expect(localStorage.getItem('apex_refresh_token')).toBeNull();
  });

  it('login stores tokens and sets the user', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      user: { id: 'user-1', email: 'jane@example.co.za', firstName: 'Jane', lastName: 'Dlamini', role: 'CUSTOMER' },
    });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    await user.click(screen.getByText('Login'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('jane@example.co.za'));
    expect(localStorage.getItem('apex_access_token')).toBe('new-access');
  });

  it('logout clears tokens and resets user to null', async () => {
    localStorage.setItem('apex_access_token', 'some-token');
    vi.mocked(authApi.getMe).mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.co.za',
      firstName: 'Jane',
      lastName: 'Dlamini',
      role: 'CUSTOMER',
    });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('jane@example.co.za'));
    await user.click(screen.getByText('Logout'));

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(localStorage.getItem('apex_access_token')).toBeNull();
  });
});