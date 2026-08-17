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
}

export interface SalesReport {
  totalOrders: number;
  totalItemsSold: number;
  totalRevenue: string;
  totalCommission: string;
  netEarnings: string;
}

export function getMyVendorOrders() {
  return apiClient.get<VendorOrderItem[]>('/vendors/me/orders');
}

export function getMySalesReport() {
  return apiClient.get<SalesReport>('/vendors/me/sales-report');
}