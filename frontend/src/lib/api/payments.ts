import { apiClient } from '../api-client';

export interface InitiatedPayment {
  id: string;
  orderId: string;
  provider: string;
  transactionRef: string;
  status: string;
  amount: string;
  redirectUrl?: string;
}

export function initiatePayment(orderId: string) {
  return apiClient.post<InitiatedPayment>('/payments', { orderId });
}
