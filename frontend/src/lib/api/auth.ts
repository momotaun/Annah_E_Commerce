import { apiClient } from '../api-client';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Where to land a user right after login/register — a vendor or admin
// otherwise has no way to find their dashboard except by already knowing
// the URL, since nothing in the nav surfaces it for them.
export function getHomeRouteForRole(role: AuthUser['role']): string {
  if (role === 'ADMIN') return '/admin/vendors';
  if (role === 'VENDOR') return '/vendor/products';
  return '/profile';
}

export function register(data: { email: string; password: string; firstName: string; lastName: string }) {
  return apiClient.post<AuthResponse>('/auth/register', data);
}

export function login(data: { email: string; password: string }) {
  return apiClient.post<AuthResponse>('/auth/login', data);
}

export function refreshTokens(refreshToken: string) {
  return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
}

export function getMe(accessToken: string) {
  return apiClient.get<AuthUser>('/users/me', { accessToken });
}

export function initiatePasswordReset(email: string) {
  return apiClient.post<{ message: string }>('/auth/password-reset', { email });
}

export function confirmPasswordReset(token: string, newPassword: string) {
  return apiClient.post<{ message: string }>('/auth/password-reset/confirm', { token, newPassword });
}

export function confirmEmailVerification(token: string) {
  return apiClient.post<{ message: string }>('/auth/verify-email/confirm', { token });
}

export function resendVerificationEmail(email: string) {
  return apiClient.post<{ message: string }>('/auth/verify-email/resend', { email });
}