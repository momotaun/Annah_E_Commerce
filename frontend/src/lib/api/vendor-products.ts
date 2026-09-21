import { apiClient } from '../api-client';
import type { ProductOptionType } from '../product-option-types';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ArchiveReason = 'TEMPORARY' | 'OUT_OF_STOCK' | 'PRODUCT_PROBLEM' | 'DAMAGES';

export interface VendorProductOption {
  type: ProductOptionType;
  values: string[];
}

export interface VendorProduct {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  /** The pre-discount "was" price. Set (and greater than price) only when
      the product is on sale. */
  compareAtPrice: string | null;
  quantity: number;
  imageUrl: string | null;
  images: string[];
  status: ProductStatus;
  archivedReason: ArchiveReason | null;
  archivedDescription: string | null;
  categoryId: string;
  /** Which variant pickers (Color, Size, Storage Capacity...) this product
      exposes — which types are valid depends on categoryId (see
      lib/product-option-types.ts). */
  options: VendorProductOption[];
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
  compareAtPrice?: number | null;
  quantity: number;
  imageUrl?: string;
  images?: string[];
  status?: ProductStatus;
  categoryId: string;
  options?: VendorProductOption[];
}) {
  return apiClient.post<VendorProduct>(`/vendors/mine/${vendorId}/products`, data);
}

export function updateVendorProduct(vendorId: string, id: string, data: Partial<{
  name: string; sku: string; description: string; price: number; compareAtPrice: number | null; quantity: number; imageUrl: string; images: string[]; status: ProductStatus; categoryId: string; options: VendorProductOption[];
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
