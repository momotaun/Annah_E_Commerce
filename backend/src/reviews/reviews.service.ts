import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  ProductReviewsResponseDto,
  ReviewResponseDto,
} from './dto/review-response.dto';

const RATING_VALUES = [5, 4, 3, 2, 1];

interface ReviewWithReviewer {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { firstName: string; lastName: string };
}

function toReviewResponseDto(review: ReviewWithReviewer): ReviewResponseDto {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    reviewerName: `${review.user.firstName} ${review.user.lastName.charAt(0)}.`,
    createdAt: review.createdAt,
  };
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }
    return product;
  }

  async findAllForProduct(
    productId: string,
  ): Promise<ProductReviewsResponseDto> {
    await this.requireProduct(productId);

    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const count = reviews.length;
    const average =
      count === 0
        ? 0
        : Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10,
          ) / 10;

    const breakdown = RATING_VALUES.map((rating) => {
      const ratingCount = reviews.filter((r) => r.rating === rating).length;
      return {
        rating,
        count: ratingCount,
        percent: count === 0 ? 0 : Math.round((ratingCount / count) * 100),
      };
    });

    return {
      reviews: reviews.map(toReviewResponseDto),
      summary: { average, count, breakdown },
    };
  }

  // One review per customer per product: writing a second one edits the
  // first instead of creating a duplicate (see the Review.@@unique in
  // schema.prisma).
  async upsert(
    userId: string,
    productId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    await this.requireProduct(productId);

    const review = await this.prisma.review.upsert({
      where: { userId_productId: { userId, productId } },
      create: {
        userId,
        productId,
        rating: dto.rating,
        comment: dto.comment ?? null,
      },
      update: {
        rating: dto.rating,
        comment: dto.comment ?? null,
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    return toReviewResponseDto(review);
  }
}
