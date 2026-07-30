import { apiClient } from '../api-client';
import { PaginatedProducts, Product } from '../api-types';

export function getProducts(params?: { category?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiClient.get<PaginatedProducts>(`/products${qs ? `?${qs}` : ''}`);
}

export function getProduct(id: string) {
  return apiClient.get<Product>(`/products/${id}`);
}

export function searchProducts(q: string, page = 1, limit = 20) {
  return apiClient.get<PaginatedProducts>(
    `/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
  );
}
