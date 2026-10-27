"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type ProductView = "grid" | "list";

export interface ViewToggleProps {
  value: ProductView;
  onChange: (value: ProductView) => void;
  className?: string;
}

const options: { value: ProductView; label: string; icon: typeof List }[] = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
];

// The grid/list switch from the category page toolbar.
function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("inline-flex overflow-hidden rounded-md border border-gray-300", className)}>
      {options.map(({ value: optionValue, label, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          aria-label={label}
          aria-pressed={value === optionValue}
          className={cn(
            "flex h-9 w-9 items-center justify-center transition-colors",
            value === optionValue ? "bg-ink text-white" : "bg-white text-ink hover:bg-gray-100"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export default ViewToggle;
