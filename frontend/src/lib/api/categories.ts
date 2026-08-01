import { apiClient } from '../api-client';
import { Category } from '../api-types';

export function getCategories() {
  return apiClient.get<Category[]>('/categories');
}
