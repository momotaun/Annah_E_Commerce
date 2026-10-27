"use client";

import { cn } from "@/src/lib/utils";

export interface PillOptionProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

function PillOption({ label, selected = false, onClick }: PillOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-ink bg-ink text-white"
          : "border-gray-300 bg-white text-ink hover:border-ink"
      )}
    >
      {label}
    </button>
  );
}

export default PillOption;