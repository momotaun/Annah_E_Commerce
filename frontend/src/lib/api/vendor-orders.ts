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

export function getMyVendorOrders() {
  return apiClient.get<VendorOrderItem[]>('/vendors/me/orders');
}

export function getMyVendorDashboard() {
  return apiClient.get<VendorDashboard>('/vendors/me/dashboard');
}

export function markOrderShipped(orderId: string) {
  return apiClient.patch<VendorOrderItem[]>(`/vendors/me/orders/${orderId}/ship`);
}

export function markOrderDelivered(orderId: string) {
  return apiClient.patch<VendorOrderItem[]>(`/vendors/me/orders/${orderId}/deliver`);
}