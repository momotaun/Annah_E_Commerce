// Shared between QueryProductsDto and SearchQueryDto — both list products
// and both offer the same sort choices, so the allowed values and the
// resulting Prisma orderBy live in one place instead of two copies that
// could drift apart.
export const PRODUCT_SORT_OPTIONS = [
  'newest',
  'price-asc',
  'price-desc',
] as const;
export type ProductSort = (typeof PRODUCT_SORT_OPTIONS)[number];

export function getProductOrderBy(sort?: ProductSort) {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' as const };
    case 'price-desc':
      return { price: 'desc' as const };
    case 'newest':
    default:
      return { createdAt: 'desc' as const };
  }
}
