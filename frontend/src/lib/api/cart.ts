import { apiClient } from '../api-client';
import { CartResponse } from '../api-types';

export function addToCart(productId: string, quantity = 1, sessionId?: string) {
  return apiClient.post<CartResponse>('/cart', { productId, quantity, sessionId });
}

export function getCart(sessionId: string) {
  return apiClient.get<CartResponse>(`/cart/${sessionId}`);
}

export function updateCartItem(sessionId: string, itemId: string, quantity: number) {
  return apiClient.patch<CartResponse>(`/cart/${sessionId}/items/${itemId}`, { quantity });
}

export function removeCartItem(sessionId: string, itemId: string) {
  return apiClient.delete<CartResponse>(`/cart/${sessionId}/items/${itemId}`);
}
