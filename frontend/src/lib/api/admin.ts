import { apiClient } from '../api-client';

export interface VendorListItem {
  id: string;
  businessName: string;
  contactEmail: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  approvedAt: string | null;
}

export interface VendorBreakdown {
  vendorId: string;
  businessName: string;
  totalRevenue: string;
  totalCommission: string;
  totalOrders: number;
}

export interface MarketplaceAnalytics {
  totalOrders: number;
  totalRevenue: string;
  totalCommissionEarned: string;
  activeVendorCount: number;
  vendorBreakdown: VendorBreakdown[];
}

export function getVendors(status?: 'PENDING' | 'APPROVED' | 'SUSPENDED') {
  const qs = status ? `?status=${status}` : '';
  return apiClient.get<VendorListItem[]>(`/vendors${qs}`);
}

export function approveVendor(vendorId: string, status: 'APPROVED' | 'SUSPENDED') {
  return apiClient.patch(`/vendors/${vendorId}/approve`, { status });
}

export function getMarketplaceAnalytics() {
  return apiClient.get<MarketplaceAnalytics>('/admin/marketplace/analytics');
}

export interface AdminOrderReturnRequest {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AdminOrderListItem {
  id: string;
  customerEmail: string;
  status: string;
  totalAmount: string;
  paymentStatus: string | null;
  returnRequest: AdminOrderReturnRequest | null;
  createdAt: string;
}

export interface PaginatedAdminOrders {
  data: AdminOrderListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getAdminOrders(page = 1) {
  return apiClient.get<PaginatedAdminOrders>(`/admin/orders?page=${page}`);
}

export function resolveReturnRequest(orderId: string, status: 'APPROVED' | 'REJECTED') {
  return apiClient.patch<AdminOrderListItem>(`/admin/orders/${orderId}/return-request`, { status });
}