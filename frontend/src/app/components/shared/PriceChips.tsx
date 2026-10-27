"use client";

import PillOption from "@/src/app/components/ui/PillOption";
import { PRICE_CEILING, PRICE_FLOOR } from "@/src/app/components/shared/FilterSidebar";

export const PRICE_CHIPS: { label: string; min: number; max: number }[] = [
  { label: "Under R100", min: PRICE_FLOOR, max: 100 },
  { label: "R100 – R249", min: 100, max: 249 },
  { label: "R250 – R499", min: 250, max: 499 },
  { label: "R500 – R999", min: 500, max: 999 },
  { label: "R1,000+", min: 1000, max: PRICE_CEILING },
];

export interface PriceChipsProps {
  /** The committed filter — undefined when no bound is set. */
  minPrice?: number;
  maxPrice?: number;
  onChange: (min: number, max: number) => void;
}

// Quick price ranges for the category toolbar. Picking the active chip again
// clears the filter.
function PriceChips({ minPrice, maxPrice, onChange }: PriceChipsProps) {
  const min = minPrice ?? PRICE_FLOOR;
  const max = maxPrice ?? PRICE_CEILING;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Price">
      {PRICE_CHIPS.map((chip) => {
        const selected = min === chip.min && max === chip.max;
        return (
          <PillOption
            key={chip.label}
            label={chip.label}
            selected={selected}
            onClick={() =>
              selected ? onChange(PRICE_FLOOR, PRICE_CEILING) : onChange(chip.min, chip.max)
            }
          />
        );
      })}
    </div>
  );
}

export default PriceChips;
