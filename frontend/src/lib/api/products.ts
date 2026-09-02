import { apiClient } from '../api-client';
import { PaginatedProducts, Product } from '../api-types';

// Matches backend/src/common/product-sort.ts's PRODUCT_SORT_OPTIONS.
export type ProductSort = 'newest' | 'price-asc' | 'price-desc';

export function getProducts(params?: {
  category?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.vendorId) query.set('vendorId', params.vendorId);
  if (params?.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params?.sort) query.set('sort', params.sort);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiClient.get<PaginatedProducts>(`/products${qs ? `?${qs}` : ''}`);
}

export function getProduct(id: string) {
  return apiClient.get<Product>(`/products/${id}`);
}

export function searchProducts(
  q: string,
  page = 1,
  limit = 20,
  sort?: ProductSort,
) {
  const query = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  if (sort) query.set('sort', sort);
  return apiClient.get<PaginatedProducts>(`/search?${query.toString()}`);
}
