import { ProductResponseDto } from '../products/dto/product-response.dto';

// Shared by every customer-facing product listing (ProductsService,
// SearchService) so they can't drift apart on what a product looks like on
// the wire — the vendor link below was missing from search until both were
// routed through here.

// Just enough vendor data to render a "Sold by" link.
export const PRODUCT_VENDOR_INCLUDE = {
  vendor: { select: { id: true, businessName: true, status: true } },
} as const;

interface ProductWithVendor {
  price: { toString(): string };
  averageRating?: { toString(): string } | null;
  vendor?: { id: string; businessName: string; status: string } | null;
  [key: string]: unknown;
}

export function toProductResponseDto(
  product: ProductWithVendor,
): ProductResponseDto {
  const { vendor, averageRating, ...rest } = product;
  return {
    ...(rest as unknown as Omit<
      ProductResponseDto,
      'price' | 'averageRating' | 'vendor'
    >),
    price: product.price.toString(),
    averageRating: averageRating ? averageRating.toString() : null,
    // Pending/suspended vendors have no public storefront
    // (VendorsService.findPublic 404s), so they're reported as no vendor
    // at all rather than a link that would dead-end.
    vendor:
      vendor?.status === 'APPROVED'
        ? { id: vendor.id, businessName: vendor.businessName }
        : null,
  };
}
