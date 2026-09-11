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

export function getMyVendorProducts(vendorId: string) {
  return apiClient.get<VendorProduct[]>(`/vendors/mine/${vendorId}/products`);
}

export function createVendorProduct(vendorId: string, data: {
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
  return apiClient.post<VendorProduct>(`/vendors/mine/${vendorId}/products`, data);
}

export function updateVendorProduct(vendorId: string, id: string, data: Partial<{
  name: string; sku: string; description: string; price: number; quantity: number; imageUrl: string; images: string[]; status: ProductStatus; categoryId: string;
}>) {
  return apiClient.patch<VendorProduct>(`/vendors/mine/${vendorId}/products/${id}`, data);
}

export function archiveVendorProduct(vendorId: string, id: string, data: { reason: ArchiveReason; description?: string }) {
  return apiClient.post<VendorProduct>(`/vendors/mine/${vendorId}/products/${id}/archive`, data);
}

export function uploadVendorProductImage(vendorId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postForm<{ url: string }>(`/vendors/mine/${vendorId}/products/images`, formData);
}
