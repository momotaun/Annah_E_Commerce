import { ProductOptionType } from '@prisma/client';

export class ProductResponseDto {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string; // Decimal serialized as string to avoid float precision issues
  // The pre-discount "was" price, same serialization as price. Null unless
  // the product is on sale (see the Product.compareAtPrice schema comment).
  compareAtPrice: string | null;
  imageUrl: string | null;
  images: string[];
  // Seeded, not review-derived (see the Product.averageRating comment in
  // schema.prisma) — Decimal serialized as string, same as price.
  averageRating: string | null;
  deliveryOption: string | null;
  segment: string | null;
  // Which variant pickers (Color, Size, Storage Capacity...) this product
  // exposes, and their values — which types are valid depends on the
  // product's category (see src/common/product-option-types.ts).
  options: { type: ProductOptionType; values: string[] }[];
  categoryId: string;
  vendorId: string | null;
  // Only set when the vendor is APPROVED — that's the only case with a
  // public storefront (VendorsService.findPublic) to link to.
  vendor: { id: string; businessName: string } | null;
  createdAt: Date;
}

export class PaginatedProductsResponseDto {
  data: ProductResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
