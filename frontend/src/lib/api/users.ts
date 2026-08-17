import { apiClient } from '../api-client';
import { AuthUser } from './auth';

export function getMyProfile() {
  return apiClient.get<AuthUser & { createdAt: string }>('/users/me');
}

export function updateMyProfile(data: { firstName?: string; lastName?: string }) {
  return apiClient.patch<AuthUser & { createdAt: string }>('/users/me', data);
}