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

// Fashion's filter set replaces the generic one entirely (see the
// isFashionOnly check below) — these are fixed, not data-driven, since
// they're specific to this one category's UI, not real Category rows
// (Fashion has no sub-categories) or query-configurable lists.
const FASHION_SEGMENTS: FilterOption[] = [
  { label: "Women", value: "WOMEN" },
  { label: "Men", value: "MEN" },
  { label: "Kids", value: "KIDS" },
  { label: "Accessories", value: "ACCESSORIES" },
];

const DELIVERY_OPTIONS: FilterOption[] = [
  { label: "Tomorrow", value: "NEXT_DAY" },
  { label: "Within 2 days", value: "TWO_DAY" },
  { label: "Collection", value: "COLLECTION" },
];

const PRICE_TIERS: { label: string; min: number; max: number }[] = [
  { label: "Under R500", min: PRICE_FLOOR, max: 500 },
  { label: "R500 to R1 000", min: 500, max: 1000 },
  { label: "R1 000 and above", min: 1000, max: PRICE_CEILING },
];

const MIN_RATING_THRESHOLD = 4;

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
  selectedSegments?: string[];
  onSegmentChange?: (value: string, checked: boolean) => void;
  selectedDelivery?: string[];
  onDeliveryChange?: (value: string, checked: boolean) => void;
  verifiedOnly?: boolean;
  onVerifiedOnlyChange?: (checked: boolean) => void;
  minRating?: number;
  onMinRatingChange?: (checked: boolean) => void;
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
  selectedSegments = [],
  onSegmentChange,
  selectedDelivery = [],
  onDeliveryChange,
  verifiedOnly = false,
  onVerifiedOnlyChange,
  minRating,
  onMinRatingChange,
}: FilterSidebarProps) {
  // Only when exactly one category is active, and it's Fashion — "All
  // Categories" (none selected) or more than one selected both fall back
  // to the generic filter set.
  const isFashionOnly =
    selectedCategories.length === 1 && selectedCategories[0] === "fashion";
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
      {isFashionOnly ? (
        <>
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
              Category
            </h3>
            <div className="flex flex-col gap-2">
              {FASHION_SEGMENTS.map((segment) => (
                <Checkbox
                  key={segment.value}
                  id={`segment-${segment.value}`}
                  label={segment.label}
                  checked={selectedSegments.includes(segment.value)}
                  onChange={(e) => onSegmentChange?.(segment.value, e.target.checked)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
              Price
            </h3>
            <div className="flex flex-col gap-2">
              {PRICE_TIERS.map((tier) => {
                const checked = minPrice === tier.min && maxPrice === tier.max;
                return (
                  <Checkbox
                    key={tier.label}
                    id={`price-tier-${tier.label}`}
                    label={tier.label}
                    checked={checked}
                    onChange={(e) =>
                      onPriceChange?.(
                        e.target.checked ? tier.min : PRICE_FLOOR,
                        e.target.checked ? tier.max : PRICE_CEILING
                      )
                    }
                  />
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
              Delivery
            </h3>
            <div className="flex flex-col gap-2">
              {DELIVERY_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  id={`delivery-${option.value}`}
                  label={option.label}
                  checked={selectedDelivery.includes(option.value)}
                  onChange={(e) => onDeliveryChange?.(option.value, e.target.checked)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
              Seller
            </h3>
            <div className="flex flex-col gap-2">
              <Checkbox
                id="verified-sellers-only"
                label="Verified sellers only"
                checked={verifiedOnly}
                onChange={(e) => onVerifiedOnlyChange?.(e.target.checked)}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
              Rating
            </h3>
            <div className="flex flex-col gap-2">
              <Checkbox
                id="min-rating"
                label={`${MIN_RATING_THRESHOLD} stars and above`}
                checked={minRating === MIN_RATING_THRESHOLD}
                onChange={(e) => onMinRatingChange?.(e.target.checked)}
              />
            </div>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </aside>
  );
}

export default FilterSidebar;
