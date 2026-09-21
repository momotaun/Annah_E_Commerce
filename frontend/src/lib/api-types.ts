import type { ProductOptionType } from "./product-option-types";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: string;
  /** The pre-discount "was" price. Set (and greater than price) only when
      the product is on sale. */
  compareAtPrice: string | null;
  imageUrl: string | null;
  images: string[];
  averageRating: string | null;
  deliveryOption: string | null;
  segment: string | null;
  /** Which variant pickers (Color, Size, Storage Capacity...) this product
      exposes, and their values — which types are valid depends on the
      product's category (see lib/product-option-types.ts). */
  options: { type: ProductOptionType; values: string[] }[];
  categoryId: string;
  vendorId: string | null;
  /** Present only for products sold by an approved vendor — the only case
      with a public storefront (`/vendors/[id]`) to link to. */
  vendor: { id: string; businessName: string } | null;
}

export interface PaginatedProducts {
  data: Product[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
    imageUrl: string | null;
    deliveryOption: string | null;
    vendor: { businessName: string; verified: boolean } | null;
  };
  lineTotal: string;
}

export interface CartResponse {
  id: string;
  sessionId: string;
  items: CartItemResponse[];
  subtotal: string;
}