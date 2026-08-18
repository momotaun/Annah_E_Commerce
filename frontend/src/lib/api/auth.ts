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