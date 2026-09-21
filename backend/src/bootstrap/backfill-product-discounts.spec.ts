import type { PrismaClient } from '@prisma/client';
import { backfillProductDiscounts } from './backfill-product-discounts';

function decimal(value: number) {
  return { toNumber: () => value };
}

describe('backfillProductDiscounts', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      product: { findMany: jest.fn(), update: jest.fn() },
    };
  });

  it('does nothing when no product needs a discount decision', async () => {
    prisma.product.findMany.mockResolvedValue([]);

    await backfillProductDiscounts(prisma as PrismaClient);

    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it('only ever queries products with no compareAtPrice yet', async () => {
    prisma.product.findMany.mockResolvedValue([]);

    await backfillProductDiscounts(prisma as PrismaClient);

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { compareAtPrice: null } }),
    );
  });

  it('leaves a product alone when the deterministic hash does not put it on sale', async () => {
    // hashSeed('discount:aero-pulse-earbuds') % 10 === 9 — outside the
    // "on sale" range (0-2) — a fixed, known-stable outcome of the hash.
    prisma.product.findMany.mockResolvedValue([
      { id: 'p1', slug: 'aero-pulse-earbuds', price: decimal(649) },
    ]);

    await backfillProductDiscounts(prisma as PrismaClient);

    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it('sets a compareAtPrice above price for a product the hash puts on sale', async () => {
    // hashSeed('discount:test-a') % 10 === 1 — inside the "on sale" range,
    // at a fixed 31% discount — a known-stable outcome of the hash.
    prisma.product.findMany.mockResolvedValue([
      { id: 'p1', slug: 'test-a', price: decimal(1000) },
    ]);

    await backfillProductDiscounts(prisma as PrismaClient);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { compareAtPrice: 1449.28 },
    });
  });

  it('uses a curated MANUAL_DISCOUNTS price for a demo-picked product, overriding the hash', async () => {
    // Whatever the hash would have decided for this slug, MANUAL_DISCOUNTS
    // is checked first and always wins for its curated demo picks.
    prisma.product.findMany.mockResolvedValue([
      {
        id: 'p1',
        slug: 'apex-elite-wireless-headphones',
        price: decimal(3799),
      },
    ]);

    await backfillProductDiscounts(prisma as PrismaClient);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { compareAtPrice: 4499.0 },
    });
  });
});
