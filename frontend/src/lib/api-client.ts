const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Simple in-memory + localStorage-backed token store, set by AuthContext
// on login/refresh/logout. Kept outside React so the plain apiClient
// functions (usable from Server Components too) don't need context.
let accessTokenOverride: string | null = null;

export const tokenStore = {
  setAccessToken(token: string | null) {
    accessTokenOverride = token;
  },
  getAccessToken() {
    return accessTokenOverride;
  },
};

let refreshInFlight: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = localStorage.getItem('apex_refresh_token');
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        localStorage.setItem('apex_access_token', data.accessToken);
        localStorage.setItem('apex_refresh_token', data.refreshToken);
        tokenStore.setAccessToken(data.accessToken);
        return data.accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

interface RequestOptions extends RequestInit {
  accessToken?: string;
  skipAuthRetry?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { accessToken, headers, skipAuthRetry, ...rest } = options;
  const token = accessToken ?? tokenStore.getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: rest.cache ?? 'no-store',
  });

  if (res.status === 401 && !skipAuthRetry && !accessToken) {
    // Access token likely expired — try one silent refresh, then retry
    // the original request exactly once. Explicit accessToken passed by
    // the caller skips this (used by auth endpoints themselves).
    const newToken = await tryRefresh();
    if (newToken) {
      return request<T>(path, { ...options, skipAuthRetry: true });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};