import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    product: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('builds no price filter when neither minPrice nor maxPrice is given', async () => {
      await service.findAll({ page: 1, limit: 20 });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];
      expect(call.where).not.toHaveProperty('price');
    });

    it('filters by minPrice alone as a lower bound', async () => {
      await service.findAll({ page: 1, limit: 20, minPrice: 100 });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        { where: { price?: { gte?: number; lte?: number } } },
      ];
      expect(call.where.price).toEqual({ gte: 100 });
    });

    it('filters by maxPrice alone as an upper bound', async () => {
      await service.findAll({ page: 1, limit: 20, maxPrice: 500 });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        { where: { price?: { gte?: number; lte?: number } } },
      ];
      expect(call.where.price).toEqual({ lte: 500 });
    });

    it('filters by both minPrice and maxPrice together', async () => {
      await service.findAll({
        page: 1,
        limit: 20,
        minPrice: 100,
        maxPrice: 500,
      });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        { where: { price?: { gte?: number; lte?: number } } },
      ];
      expect(call.where.price).toEqual({ gte: 100, lte: 500 });
    });

    it('a price of 0 still applies as a real lower bound, not a falsy no-op', async () => {
      await service.findAll({ page: 1, limit: 20, minPrice: 0 });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        { where: { price?: { gte?: number; lte?: number } } },
      ];
      expect(call.where.price).toEqual({ gte: 0 });
    });

    it('combines the price filter with category and vendorId filters', async () => {
      await service.findAll({
        page: 1,
        limit: 20,
        category: 'apparel',
        vendorId: 'vendor-1',
        minPrice: 100,
        maxPrice: 500,
      });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        {
          where: {
            category?: { slug: string };
            vendorId?: string;
            price?: { gte?: number; lte?: number };
          };
        },
      ];
      expect(call.where).toEqual({
        category: { slug: 'apparel' },
        vendorId: 'vendor-1',
        price: { gte: 100, lte: 500 },
      });
    });

    it('defaults to newest-first when no sort is given', async () => {
      await service.findAll({ page: 1, limit: 20 });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        { orderBy: unknown },
      ];
      expect(call.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('sorts by price ascending when requested', async () => {
      await service.findAll({ page: 1, limit: 20, sort: 'price-asc' });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        { orderBy: unknown },
      ];
      expect(call.orderBy).toEqual({ price: 'asc' });
    });

    it('sorts by price descending when requested', async () => {
      await service.findAll({ page: 1, limit: 20, sort: 'price-desc' });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        { orderBy: unknown },
      ];
      expect(call.orderBy).toEqual({ price: 'desc' });
    });

    it('paginates using skip/take derived from page and limit', async () => {
      prisma.product.count.mockResolvedValue(45);

      const result = await service.findAll({ page: 3, limit: 10 });

      const [call] = prisma.product.findMany.mock.calls[0] as [
        { skip: number; take: number },
      ];
      expect(call.skip).toBe(20);
      expect(call.take).toBe(10);
      expect(result.meta).toEqual({
        page: 3,
        limit: 10,
        total: 45,
        totalPages: 5,
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when no product matches the id or slug', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(service.findOne('does-not-exist')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('serializes the Decimal price to a string', async () => {
      prisma.product.findFirst.mockResolvedValue({
        id: 'product-1',
        slug: 'apex-silk-pocket-square',
        price: { toString: () => '349.00' },
      });

      const result = await service.findOne('apex-silk-pocket-square');

      expect(result.price).toBe('349.00');
    });
  });
});
