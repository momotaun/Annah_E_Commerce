import { apiClient } from '../api-client';

export interface VendorOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  lineTotal: string;
  commissionAmount: string;
  orderStatus: string;
  orderCreatedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface VendorDashboard {
  totalOrders: number;
  totalItemsSold: number;
  totalRevenue: string;
  totalCommission: string;
  netEarnings: string;
  revenueOverTime: RevenueDataPoint[];
  ordersByStatus: OrderStatusCount[];
  topProducts: TopProduct[];
}

export function getMyVendorOrders(vendorId: string) {
  return apiClient.get<VendorOrderItem[]>(`/vendors/mine/${vendorId}/orders`);
}

export function getMyVendorDashboard(vendorId: string) {
  return apiClient.get<VendorDashboard>(`/vendors/mine/${vendorId}/dashboard`);
}

export function markOrderShipped(vendorId: string, orderId: string) {
  return apiClient.patch<VendorOrderItem[]>(`/vendors/mine/${vendorId}/orders/${orderId}/ship`);
}

export function markOrderDelivered(vendorId: string, orderId: string) {
  return apiClient.patch<VendorOrderItem[]>(`/vendors/mine/${vendorId}/orders/${orderId}/deliver`);
}
