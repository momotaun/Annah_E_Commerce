import { apiClient } from '../api-client';
import { PaginatedProducts, Product } from '../api-types';

export function getProducts(params?: {
  category?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.vendorId) query.set('vendorId', params.vendorId);
  if (params?.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
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
