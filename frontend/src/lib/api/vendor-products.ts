import { apiClient } from '../api-client';

export interface VendorProduct {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  categoryId: string;
  createdAt: string;
}

export function getMyVendorProducts() {
  return apiClient.get<VendorProduct[]>('/vendors/me/products');
}

export function createVendorProduct(data: {
  name: string;
  sku: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
}) {
  return apiClient.post<VendorProduct>('/vendors/me/products', data);
}

export function updateVendorProduct(id: string, data: Partial<{
  name: string; sku: string; description: string; price: number; imageUrl: string; categoryId: string;
}>) {
  return apiClient.patch<VendorProduct>(`/vendors/me/products/${id}`, data);
}