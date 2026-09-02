import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: { product: { findMany: jest.Mock; count: jest.Mock } };

  beforeEach(async () => {
    prisma = { product: { findMany: jest.fn(), count: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('searches both name and description, case-insensitively', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);

    await service.search({ q: 'ProBook', page: 1, limit: 20 });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: 'ProBook', mode: 'insensitive' } },
            { description: { contains: 'ProBook', mode: 'insensitive' } },
          ],
        },
      }),
    );
  });

  it('returns paginated results in the same shape as ProductsService', async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: '1', price: { toString: () => '50.00' } },
    ]);
    prisma.product.count.mockResolvedValue(1);

    const result = await service.search({ q: 'test', page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('defaults to newest-first when no sort is given', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);

    await service.search({ q: 'test', page: 1, limit: 20 });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });

  it('sorts search results by price when requested', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);

    await service.search({ q: 'test', page: 1, limit: 20, sort: 'price-asc' });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { price: 'asc' } }),
    );
  });
});
