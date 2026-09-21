import { ProductOptionType } from '@prisma/client';

export interface ProductOptionTypeDef {
  type: ProductOptionType;
  label: string;
}

// The single source of truth for which variant pickers a category's
// products can expose, and what to label them. Mirrored on the frontend at
// frontend/src/lib/product-option-types.ts — keep both in sync when this
// changes (same duplication convention as DELIVERY_OPTIONS/PRODUCT_SEGMENTS,
// which the frontend's FilterSidebar also keeps its own copy of).
//
// Keyed by Category.slug rather than id: stable across environments/seeds,
// unlike the cuid.
export const CATEGORY_OPTION_TYPES: Record<string, ProductOptionTypeDef[]> = {
  fashion: [
    { type: 'COLOR', label: 'Color' },
    { type: 'SIZE', label: 'Size' },
  ],
  electronics: [
    { type: 'COLOR', label: 'Color' },
    { type: 'STORAGE_CAPACITY', label: 'Storage Capacity' },
  ],
  computing: [
    { type: 'COLOR', label: 'Color' },
    { type: 'STORAGE_CAPACITY', label: 'Storage Capacity' },
  ],
  audio: [{ type: 'COLOR', label: 'Color' }],
  'home-living': [{ type: 'COLOR', label: 'Color' }],
  'camping-hiking': [{ type: 'COLOR', label: 'Color' }],
  'fitness-equipment': [{ type: 'COLOR', label: 'Color' }],
  // Beauty & Health / Personal Care / Skincare / Sports & Outdoor: no
  // variant pickers — omitted keys resolve to [] via optionTypesForCategory.
};

export function optionTypesForCategory(
  categorySlug: string,
): ProductOptionTypeDef[] {
  return CATEGORY_OPTION_TYPES[categorySlug] ?? [];
}
