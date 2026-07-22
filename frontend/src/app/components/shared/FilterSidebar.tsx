"use client";

import { useState } from "react";
import Checkbox from "@/src/app/components/ui/Checkbox";
import Input from "@/src/app/components/ui/Input";
import ColorSwatch from "@/src/app/components/ui/ColorSwatch";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSidebarProps {
  categories: FilterOption[];
  brands: FilterOption[];
  colors?: string[];
  selectedCategories?: string[];
  selectedBrands?: string[];
  onCategoryChange?: (value: string, checked: boolean) => void;
  onBrandChange?: (value: string, checked: boolean) => void;
  onColorSelect?: (color: string) => void;
  minPrice?: number;
  maxPrice?: number;
}

function FilterSidebar({
  categories,
  brands,
  colors = [],
  selectedCategories = [],
  selectedBrands = [],
  onCategoryChange,
  onBrandChange,
  onColorSelect,
  minPrice = 0,
  maxPrice = 5000,
}: FilterSidebarProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  return (
    <aside className="flex w-full flex-col gap-8 md:w-64">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
          Categories
        </h3>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <Checkbox
              key={cat.value}
              id={`cat-${cat.value}`}
              label={cat.label}
              checked={selectedCategories.includes(cat.value)}
              onChange={(e) => onCategoryChange?.(cat.value, e.target.checked)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
          Price Range
        </h3>
        <input
          type="range"
          min={0}
          max={5000}
          className="w-full accent-primary-600"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <Input defaultValue={`R${minPrice}`} className="h-9 text-sm" />
          <Input defaultValue={`R${maxPrice}+`} className="h-9 text-sm" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
          Brand
        </h3>
        <div className="flex flex-col gap-2">
          {brands.map((brand) => (
            <Checkbox
              key={brand.value}
              id={`brand-${brand.value}`}
              label={brand.label}
              checked={selectedBrands.includes(brand.value)}
              onChange={(e) => onBrandChange?.(brand.value, e.target.checked)}
            />
          ))}
        </div>
      </div>

      {colors.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
            Color Swatches
          </h3>
          <div className="flex gap-2">
            {colors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                selected={selectedColor === color}
                onClick={() => {
                  setSelectedColor(color);
                  onColorSelect?.(color);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export default FilterSidebar;