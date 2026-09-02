"use client";

import { useEffect, useState } from "react";
import Checkbox from "@/src/app/components/ui/Checkbox";
import Input from "@/src/app/components/ui/Input";
import ColorSwatch from "@/src/app/components/ui/ColorSwatch";

export interface FilterOption {
  label: string;
  value: string;
}

// Static bounds for the slider's own track, independent of whatever
// min/maxPrice filter happens to be active. Safely above the catalogue's
// real max (currently R45,999) — a slider needs a fixed ceiling to render
// at all, so this would need bumping if pricing ever exceeds it.
export const PRICE_FLOOR = 0;
export const PRICE_CEILING = 50000;
const PRICE_STEP = 100;

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
  onPriceChange?: (min: number, max: number) => void;
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
  minPrice = PRICE_FLOOR,
  maxPrice = PRICE_CEILING,
  onPriceChange,
}: FilterSidebarProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Local, immediately-responsive slider state, separate from the
  // minPrice/maxPrice props (which reflect the committed, URL-driven
  // filter passed down from the parent). Dragging updates this on every
  // frame for smooth visual feedback; onPriceChange only fires once the
  // user releases the thumb, tabs off a number field, or presses Enter —
  // not on every pixel of drag, which would otherwise refetch constantly.
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalMin(minPrice);
      setLocalMax(maxPrice);
    }, 0);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  function commitPrice(min: number, max: number) {
    const clampedMin = Math.min(min, max);
    const clampedMax = Math.max(min, max);
    setLocalMin(clampedMin);
    setLocalMax(clampedMax);
    onPriceChange?.(clampedMin, clampedMax);
  }

  const minPercent =
    ((localMin - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR)) * 100;
  const maxPercent =
    ((localMax - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR)) * 100;

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

        <div className="relative h-4">
          <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-200" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-600"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />
          <input
            type="range"
            aria-label="Minimum price"
            min={PRICE_FLOOR}
            max={PRICE_CEILING}
            step={PRICE_STEP}
            value={localMin}
            onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax))}
            onMouseUp={() => commitPrice(localMin, localMax)}
            onTouchEnd={() => commitPrice(localMin, localMax)}
            onKeyUp={() => commitPrice(localMin, localMax)}
            className="range-slider-thumb absolute top-1/2 h-1.5 w-full -translate-y-1/2"
          />
          <input
            type="range"
            aria-label="Maximum price"
            min={PRICE_FLOOR}
            max={PRICE_CEILING}
            step={PRICE_STEP}
            value={localMax}
            onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin))}
            onMouseUp={() => commitPrice(localMin, localMax)}
            onTouchEnd={() => commitPrice(localMin, localMax)}
            onKeyUp={() => commitPrice(localMin, localMax)}
            className="range-slider-thumb absolute top-1/2 h-1.5 w-full -translate-y-1/2"
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Input
            type="number"
            icon={<span className="text-sm">R</span>}
            min={PRICE_FLOOR}
            max={localMax}
            value={localMin}
            onChange={(e) =>
              setLocalMin(Math.min(Number(e.target.value) || 0, localMax))
            }
            onBlur={() => commitPrice(localMin, localMax)}
            onKeyDown={(e) => e.key === "Enter" && commitPrice(localMin, localMax)}
            aria-label="Minimum price"
            className="h-9 text-sm"
          />
          <span className="text-gray-400">–</span>
          <Input
            type="number"
            icon={<span className="text-sm">R</span>}
            min={localMin}
            max={PRICE_CEILING}
            value={localMax}
            onChange={(e) =>
              setLocalMax(Math.max(Number(e.target.value) || 0, localMin))
            }
            onBlur={() => commitPrice(localMin, localMax)}
            onKeyDown={(e) => e.key === "Enter" && commitPrice(localMin, localMax)}
            aria-label="Maximum price"
            className="h-9 text-sm"
          />
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
