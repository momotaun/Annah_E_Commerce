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
          ? "border-primary-600 bg-primary-50 text-primary-600"
          : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
      )}
    >
      {label}
    </button>
  );
}

export default PillOption;