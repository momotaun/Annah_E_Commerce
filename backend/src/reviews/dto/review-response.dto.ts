export class ReviewResponseDto {
  id: string;
  rating: number;
  comment: string | null;
  // "Jane D." — first name + last-initial, never the full last name, so a
  // public product page never prints a customer's full legal surname.
  reviewerName: string;
  createdAt: Date;
}

export class ReviewBreakdownRowDto {
  rating: number;
  count: number;
  percent: number;
}

export class ReviewSummaryDto {
  average: number;
  count: number;
  breakdown: ReviewBreakdownRowDto[];
}

export class ProductReviewsResponseDto {
  reviews: ReviewResponseDto[];
  summary: ReviewSummaryDto;
}
