import { apiClient } from '../api-client';

export interface OrderListItem {
  id: string;
  status: string;
  totalAmount: string;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  status: string;
  totalAmount: string;
  address: { line1: string; city: string; province: string; postalCode: string };
  items: {
    id: string;
    productId: string;
    productName: string;
    productImageUrl: string | null;
    quantity: number;
    priceAtOrder: string;
  }[];
  payments: { id: string; provider: string; status: string; amount: string }[];
  invoice: { invoiceNumber: string; issuedAt: string } | null;
  createdAt: string;
}

export function getMyOrders() {
  return apiClient.get<OrderListItem[]>('/orders');
}

export function getMyOrder(id: string) {
  return apiClient.get<OrderDetail>(`/orders/${id}`);
}