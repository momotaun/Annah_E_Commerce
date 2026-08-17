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