import type { PrismaClient } from '@prisma/client';
import { backfillProductGalleryImages } from './backfill-product-gallery-images';

describe('backfillProductGalleryImages', () => {
  let prisma: any;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    prisma = {
      product: { findMany: jest.fn(), update: jest.fn() },
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function setObjectStorageEnv() {
    process.env.OBJECT_STORAGE_ENDPOINT =
      'https://example.storage.aws.neon.tech';
    process.env.OBJECT_STORAGE_ACCESS_KEY_ID = 'key';
    process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY = 'secret';
    process.env.OBJECT_STORAGE_BUCKET = 'product-images';
    process.env.OBJECT_STORAGE_PUBLIC_URL_BASE =
      'https://example.storage.aws.neon.tech/product-images';
  }

  it('does nothing when object storage is not configured', async () => {
    delete process.env.OBJECT_STORAGE_ENDPOINT;
    delete process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
    delete process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
    delete process.env.OBJECT_STORAGE_BUCKET;
    delete process.env.OBJECT_STORAGE_PUBLIC_URL_BASE;

    await backfillProductGalleryImages(prisma as PrismaClient);

    expect(prisma.product.findMany).not.toHaveBeenCalled();
  });

  it('does nothing when every product already has a real 3-image gallery', async () => {
    setObjectStorageEnv();
    prisma.product.findMany.mockResolvedValue([
      {
        id: 'p1',
        name: 'Apex Elite Wireless Headphones',
        imageUrl: 'https://example.storage.aws.neon.tech/product-images/x.jpg',
        images: ['a', 'b', 'c'],
      },
    ]);

    await backfillProductGalleryImages(prisma as PrismaClient);

    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it('skips a product with no gallery bucket mapping instead of throwing', async () => {
    setObjectStorageEnv();
    prisma.product.findMany.mockResolvedValue([
      {
        id: 'p1',
        name: 'Store A Exclusive Widget',
        imageUrl: null,
        images: [],
      },
    ]);

    await backfillProductGalleryImages(prisma as PrismaClient);

    expect(prisma.product.update).not.toHaveBeenCalled();
  });

});
