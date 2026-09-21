import { ProductOptionType } from '@prisma/client';
import { ProductResponseDto } from '../products/dto/product-response.dto';

// Shared by every customer-facing product listing (ProductsService,
// SearchService) so they can't drift apart on what a product looks like on
// the wire — the vendor link below was missing from search until both were
// routed through here.

// Just enough vendor data to render a "Sold by" link, plus this product's
// variant pickers (see src/common/product-option-types.ts for which types
// are valid per category).
export const PRODUCT_VENDOR_INCLUDE = {
  vendor: { select: { id: true, businessName: true, status: true } },
  options: { select: { type: true, values: true } },
} as const;

interface ProductWithVendor {
  price: { toString(): string };
  compareAtPrice?: { toString(): string } | null;
  averageRating?: { toString(): string } | null;
  vendor?: { id: string; businessName: string; status: string } | null;
  options?: { type: ProductOptionType; values: string[] }[];
  [key: string]: unknown;
}

export function toProductResponseDto(
  product: ProductWithVendor,
): ProductResponseDto {
  const { vendor, averageRating, compareAtPrice, options, ...rest } = product;
  return {
    ...(rest as unknown as Omit<
      ProductResponseDto,
      'price' | 'compareAtPrice' | 'averageRating' | 'vendor' | 'options'
    >),
    price: product.price.toString(),
    compareAtPrice: compareAtPrice ? compareAtPrice.toString() : null,
    averageRating: averageRating ? averageRating.toString() : null,
    options: options ?? [],
    // Pending/suspended vendors have no public storefront
    // (VendorsService.findPublic 404s), so they're reported as no vendor
    // at all rather than a link that would dead-end.
    vendor:
      vendor?.status === 'APPROVED'
        ? { id: vendor.id, businessName: vendor.businessName }
        : null,
  };
}
