import type { PrismaClient } from '@prisma/client';

// Curated picks for the demo — one well-known product per major category,
// takes priority over the random hash below so these specific products are
// always on sale (rather than leaving it to chance whether the hash landed
// on them). Keyed by slug, value is the compareAtPrice.
const MANUAL_DISCOUNTS: Record<string, number> = {
  'apex-elite-wireless-headphones': 4499.0,
  'meridian-tailored-blazer': 2999.0,
  'nordic-oak-coffee-table': 5999.0,
};

// Deterministic per-product hash, same technique as prisma/seed.ts's
// ratingFor/deliveryOptionFor — stable across runs (seeded from the slug),
// so re-running this backfill never flips a product's discount on/off.
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// About 3 in 10 products go on sale, at a 10-35% discount.
function compareAtPriceFor(slug: string, price: number): number | null {
  const hash = hashSeed(`discount:${slug}`);
  if (hash % 10 >= 3) return null;

  const discountPercent = 10 + (hash % 26); // 10 – 35
  return Math.round((price / (1 - discountPercent / 100)) * 100) / 100;
}

/**
 * Puts MANUAL_DISCOUNTS' curated picks on sale, plus a deterministic ~30%
 * of the rest of the demo catalogue, for the product detail page's
 * discount display. Runs on every boot (see src/scripts/seed-site-content.ts)
 * and only ever touches products that have never been assigned a
 * compareAtPrice yet (real vendor-set discounts, or a previous run of this
 * same backfill, are left alone) — cheap and idempotent to repeat.
 */
export async function backfillProductDiscounts(
  prisma: PrismaClient,
): Promise<void> {
  const candidates = await prisma.product.findMany({
    where: { compareAtPrice: null },
    select: { id: true, slug: true, price: true },
  });
  if (candidates.length === 0) {
    return;
  }

  let updated = 0;
  for (const product of candidates) {
    const compareAtPrice =
      MANUAL_DISCOUNTS[product.slug] ??
      compareAtPriceFor(product.slug, product.price.toNumber());
    if (compareAtPrice === null || compareAtPrice === undefined) continue;

    await prisma.product.update({
      where: { id: product.id },
      data: { compareAtPrice },
    });
    updated++;
  }

  console.log(
    `Product discount backfill: put ${updated} product(s) on sale.`,
  );
}
