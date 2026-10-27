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

// Sub-categories (Fashion > Men > Tops) have no entry of their own — they
// inherit the option types of their nearest ancestor that does. `loadParent`
// fetches a category's parent by id so this stays independent of Prisma.
export async function resolveOptionTypesForCategory(
  category: { slug: string; parentId?: string | null },
  loadParent: (
    parentId: string,
  ) => Promise<{ slug: string; parentId?: string | null } | null>,
): Promise<ProductOptionTypeDef[]> {
  let current: { slug: string; parentId?: string | null } | null = category;
  // The depth cap guards against a (bad-data) parent cycle.
  for (let depth = 0; current && depth < 10; depth++) {
    const own = CATEGORY_OPTION_TYPES[current.slug];
    if (own) return own;
    current = current.parentId ? await loadParent(current.parentId) : null;
  }
  return [];
}

export function optionTypesForCategory(
  categorySlug: string,
): ProductOptionTypeDef[] {
  return CATEGORY_OPTION_TYPES[categorySlug] ?? [];
}
