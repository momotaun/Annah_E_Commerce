import { apiClient } from '../api-client';

export interface OrderResult {
  id: string;
  status: string;
  totalAmount: string;
  addressId: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    priceAtOrder: string;
  }[];
  invoiceNumber: string;
  createdAt: string;
}

export function checkout(data: { sessionId: string; addressId: string }) {
  return apiClient.post<OrderResult>('/checkout', data);
}