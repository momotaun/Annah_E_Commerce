import type { PrismaClient } from '@prisma/client';
import { backfillSeedImages } from './backfill-seed-images';

describe('backfillSeedImages', () => {
  let prisma: any;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    prisma = {
      product: { findMany: jest.fn(), update: jest.fn() },
      heroSlide: { findMany: jest.fn(), update: jest.fn() },
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('does nothing when object storage is not configured', async () => {
    delete process.env.OBJECT_STORAGE_ENDPOINT;
    delete process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
    delete process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
    delete process.env.OBJECT_STORAGE_BUCKET;
    delete process.env.OBJECT_STORAGE_PUBLIC_URL_BASE;

    await backfillSeedImages(prisma as PrismaClient);

    expect(prisma.product.findMany).not.toHaveBeenCalled();
    expect(prisma.heroSlide.findMany).not.toHaveBeenCalled();
  });

  it('does nothing when no rows still carry a local /images/ path', async () => {
    process.env.OBJECT_STORAGE_ENDPOINT =
      'https://example.storage.aws.neon.tech';
    process.env.OBJECT_STORAGE_ACCESS_KEY_ID = 'key';
    process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY = 'secret';
    process.env.OBJECT_STORAGE_BUCKET = 'product-images';
    process.env.OBJECT_STORAGE_PUBLIC_URL_BASE =
      'https://example.storage.aws.neon.tech/product-images';

    prisma.product.findMany.mockResolvedValue([]);
    prisma.heroSlide.findMany.mockResolvedValue([]);

    await backfillSeedImages(prisma as PrismaClient);

    expect(prisma.product.update).not.toHaveBeenCalled();
    expect(prisma.heroSlide.update).not.toHaveBeenCalled();
  });

  it('leaves a stale row untouched when no local copy of its image exists', async () => {
    process.env.OBJECT_STORAGE_ENDPOINT =
      'https://example.storage.aws.neon.tech';
    process.env.OBJECT_STORAGE_ACCESS_KEY_ID = 'key';
    process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY = 'secret';
    process.env.OBJECT_STORAGE_BUCKET = 'product-images';
    process.env.OBJECT_STORAGE_PUBLIC_URL_BASE =
      'https://example.storage.aws.neon.tech/product-images';

    prisma.product.findMany.mockResolvedValue([
      { id: 'p1', imageUrl: '/images/definitely-not-a-real-seed-file.jpg' },
    ]);
    prisma.heroSlide.findMany.mockResolvedValue([]);

    await backfillSeedImages(prisma as PrismaClient);

    expect(prisma.product.update).not.toHaveBeenCalled();
  });
});
