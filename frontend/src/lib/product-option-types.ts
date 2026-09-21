export type ProductOptionType = "COLOR" | "SIZE" | "STORAGE_CAPACITY";

export interface ProductOptionTypeDef {
  type: ProductOptionType;
  label: string;
}

// Mirrors backend/src/common/product-option-types.ts's CATEGORY_OPTION_TYPES
// — the single source of truth for which variant pickers a category's
// products can expose. Keep both in sync when this changes (same
// duplication convention as FilterSidebar's FASHION_SEGMENTS/DELIVERY_OPTIONS,
// which also mirror backend enums rather than fetching them).
const CATEGORY_OPTION_TYPES: Record<string, ProductOptionTypeDef[]> = {
  fashion: [
    { type: "COLOR", label: "Color" },
    { type: "SIZE", label: "Size" },
  ],
  electronics: [
    { type: "COLOR", label: "Color" },
    { type: "STORAGE_CAPACITY", label: "Storage Capacity" },
  ],
  computing: [
    { type: "COLOR", label: "Color" },
    { type: "STORAGE_CAPACITY", label: "Storage Capacity" },
  ],
  audio: [{ type: "COLOR", label: "Color" }],
  "home-living": [{ type: "COLOR", label: "Color" }],
  "camping-hiking": [{ type: "COLOR", label: "Color" }],
  "fitness-equipment": [{ type: "COLOR", label: "Color" }],
};

export function optionTypesForCategory(categorySlug: string | undefined): ProductOptionTypeDef[] {
  if (!categorySlug) return [];
  return CATEGORY_OPTION_TYPES[categorySlug] ?? [];
}
