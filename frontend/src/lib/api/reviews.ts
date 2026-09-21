import { apiClient } from '../api-client';

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  reviewerName: string;
  createdAt: string;
}

export interface ReviewBreakdownRow {
  rating: number;
  count: number;
  percent: number;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  summary: {
    average: number;
    count: number;
    breakdown: ReviewBreakdownRow[];
  };
}

export function getProductReviews(productId: string) {
  return apiClient.get<ProductReviewsResponse>(`/products/${productId}/reviews`);
}

// Submitting twice for the same product edits your existing review instead
// of adding a second one — see backend ReviewsService.upsert.
export function submitProductReview(productId: string, data: { rating: number; comment?: string }) {
  return apiClient.post<Review>(`/products/${productId}/reviews`, data);
}
