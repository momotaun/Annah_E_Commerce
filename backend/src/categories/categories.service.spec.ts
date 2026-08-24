import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { category: { findMany: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('returns an empty array when there are no categories', async () => {
    prisma.category.findMany.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
  });

  it('nests child categories under their parent', async () => {
    prisma.category.findMany.mockResolvedValue([
      {
        id: 'electronics',
        name: 'Electronics',
        slug: 'electronics',
        parentId: null,
        createdAt: new Date(),
      },
      {
        id: 'computing',
        name: 'Computing',
        slug: 'computing',
        parentId: 'electronics',
        createdAt: new Date(),
      },
      {
        id: 'home',
        name: 'Home & Living',
        slug: 'home-living',
        parentId: null,
        createdAt: new Date(),
      },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(2); // two roots: Electronics, Home & Living
    const electronics = result.find((c) => c.id === 'electronics');
    expect(electronics?.children).toHaveLength(1);
    expect(electronics?.children[0].id).toBe('computing');

    const home = result.find((c) => c.id === 'home');
    expect(home?.children).toHaveLength(0);
  });

  it('does not lose a child whose parent appears later in the array', async () => {
    // Order shouldn't matter — a Map-based lookup handles this regardless
    // of array ordering, this test just proves that explicitly.
    prisma.category.findMany.mockResolvedValue([
      {
        id: 'computing',
        name: 'Computing',
        slug: 'computing',
        parentId: 'electronics',
        createdAt: new Date(),
      },
      {
        id: 'electronics',
        name: 'Electronics',
        slug: 'electronics',
        parentId: null,
        createdAt: new Date(),
      },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].children[0].id).toBe('computing');
  });
});
