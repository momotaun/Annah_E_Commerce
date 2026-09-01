import { apiClient } from '../api-client';

export interface OrderReturnRequest {
  status: string;
  reason: string;
  createdAt: string;
}

export interface OrderListItem {
  id: string;
  status: string;
  totalAmount: string;
  itemCount: number;
  returnRequest: OrderReturnRequest | null;
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
  returnRequest: OrderReturnRequest | null;
  createdAt: string;
}

export function getMyOrders() {
  return apiClient.get<OrderListItem[]>('/orders');
}

export function getMyOrder(id: string) {
  return apiClient.get<OrderDetail>(`/orders/${id}`);
}

export function cancelOrder(id: string) {
  return apiClient.post<OrderListItem>(`/orders/${id}/cancel`);
}

export function requestReturn(id: string, reason: string) {
  return apiClient.post<OrderListItem>(`/orders/${id}/return-request`, { reason });
}