import { apiClient } from '../api-client';
import { Product } from '../api-types';

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export function getWishlist() {
  return apiClient.get<WishlistItem[]>('/users/me/wishlist');
}

export function addToWishlist(productId: string) {
  return apiClient.post<{ id: string; productId: string; createdAt: string }>(
    '/users/me/wishlist',
    { productId },
  );
}

export function removeFromWishlist(productId: string) {
  return apiClient.delete<void>(`/users/me/wishlist/${productId}`);
}
