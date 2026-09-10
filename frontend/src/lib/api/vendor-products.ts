import { apiClient } from '../api-client';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ArchiveReason = 'TEMPORARY' | 'OUT_OF_STOCK' | 'PRODUCT_PROBLEM' | 'DAMAGES';

export interface VendorProduct {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  quantity: number;
  imageUrl: string | null;
  images: string[];
  status: ProductStatus;
  archivedReason: ArchiveReason | null;
  archivedDescription: string | null;
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
  quantity: number;
  imageUrl?: string;
  images?: string[];
  status?: ProductStatus;
  categoryId: string;
}) {
  return apiClient.post<VendorProduct>('/vendors/me/products', data);
}

export function updateVendorProduct(id: string, data: Partial<{
  name: string; sku: string; description: string; price: number; quantity: number; imageUrl: string; images: string[]; status: ProductStatus; categoryId: string;
}>) {
  return apiClient.patch<VendorProduct>(`/vendors/me/products/${id}`, data);
}

export function archiveVendorProduct(id: string, data: { reason: ArchiveReason; description?: string }) {
  return apiClient.post<VendorProduct>(`/vendors/me/products/${id}/archive`, data);
}

export function uploadVendorProductImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postForm<{ url: string }>('/vendors/me/products/images', formData);
}
