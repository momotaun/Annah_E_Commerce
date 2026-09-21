import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: { findUnique: jest.fn() },
      review: { findMany: jest.fn(), upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('findAllForProduct', () => {
    it('throws NotFoundException for a product that does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findAllForProduct('missing-product')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.review.findMany).not.toHaveBeenCalled();
    });

    it('returns a zeroed summary and no reviews when none exist yet', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.review.findMany.mockResolvedValue([]);

      const result = await service.findAllForProduct('product-1');

      expect(result.reviews).toEqual([]);
      expect(result.summary).toEqual({
        average: 0,
        count: 0,
        breakdown: [
          { rating: 5, count: 0, percent: 0 },
          { rating: 4, count: 0, percent: 0 },
          { rating: 3, count: 0, percent: 0 },
          { rating: 2, count: 0, percent: 0 },
          { rating: 1, count: 0, percent: 0 },
        ],
      });
    });

    it('computes the average, count, and star breakdown from real reviews', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.review.findMany.mockResolvedValue([
        {
          id: 'r1',
          rating: 5,
          comment: 'Loved it',
          createdAt: new Date('2026-01-01'),
          user: { firstName: 'Jane', lastName: 'Doe' },
        },
        {
          id: 'r2',
          rating: 5,
          comment: null,
          createdAt: new Date('2026-01-02'),
          user: { firstName: 'Sam', lastName: 'Smith' },
        },
        {
          id: 'r3',
          rating: 3,
          comment: 'It was okay',
          createdAt: new Date('2026-01-03'),
          user: { firstName: 'Alex', lastName: 'Jones' },
        },
      ]);

      const result = await service.findAllForProduct('product-1');

      expect(result.summary.count).toBe(3);
      expect(result.summary.average).toBeCloseTo(4.3, 1);
      expect(result.summary.breakdown.find((b) => b.rating === 5)).toEqual({
        rating: 5,
        count: 2,
        percent: 67,
      });
      expect(result.summary.breakdown.find((b) => b.rating === 3)).toEqual({
        rating: 3,
        count: 1,
        percent: 33,
      });
      expect(result.reviews[0]).toEqual({
        id: 'r1',
        rating: 5,
        comment: 'Loved it',
        reviewerName: 'Jane D.',
        createdAt: new Date('2026-01-01'),
      });
    });
  });

  describe('upsert', () => {
    it('throws NotFoundException for a product that does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.upsert('user-1', 'missing-product', { rating: 5 }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.review.upsert).not.toHaveBeenCalled();
    });

    it('upserts on the (userId, productId) compound key, keyed off the real column names', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.review.upsert.mockResolvedValue({
        id: 'r1',
        rating: 4,
        comment: 'Solid product',
        createdAt: new Date('2026-01-01'),
        user: { firstName: 'Jane', lastName: 'Doe' },
      });

      const result = await service.upsert('user-1', 'product-1', {
        rating: 4,
        comment: 'Solid product',
      });

      expect(prisma.review.upsert).toHaveBeenCalledWith({
        where: { userId_productId: { userId: 'user-1', productId: 'product-1' } },
        create: {
          userId: 'user-1',
          productId: 'product-1',
          rating: 4,
          comment: 'Solid product',
        },
        update: { rating: 4, comment: 'Solid product' },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
      expect(result).toEqual({
        id: 'r1',
        rating: 4,
        comment: 'Solid product',
        reviewerName: 'Jane D.',
        createdAt: new Date('2026-01-01'),
      });
    });

    it('re-submitting a review overwrites the previous one instead of adding a second', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.review.upsert.mockResolvedValue({
        id: 'r1',
        rating: 2,
        comment: 'Changed my mind',
        createdAt: new Date('2026-01-01'),
        user: { firstName: 'Jane', lastName: 'Doe' },
      });

      await service.upsert('user-1', 'product-1', {
        rating: 2,
        comment: 'Changed my mind',
      });

      // A second call for the same (user, product) pair must still be a
      // single upsert — Prisma enforces the actual no-duplicate-rows
      // guarantee via the schema's @@unique, this just checks the service
      // asks for an upsert rather than a plain create.
      expect(prisma.review.upsert).toHaveBeenCalledTimes(1);
    });
  });
});
