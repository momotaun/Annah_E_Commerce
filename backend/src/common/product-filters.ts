// Mirrors the Prisma DeliveryOption/ProductSegment enums — kept here as
// plain string arrays (rather than importing the generated enum) so
// class-validator's @IsIn can use them directly in QueryProductsDto.
export const DELIVERY_OPTIONS = ['NEXT_DAY', 'TWO_DAY', 'COLLECTION'] as const;
export type DeliveryOptionFilter = (typeof DELIVERY_OPTIONS)[number];

export const PRODUCT_SEGMENTS = [
  'WOMEN',
  'MEN',
  'KIDS',
  'ACCESSORIES',
] as const;
export type ProductSegmentFilter = (typeof PRODUCT_SEGMENTS)[number];
