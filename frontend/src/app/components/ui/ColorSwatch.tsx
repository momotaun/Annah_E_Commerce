"use client";

import { cn } from "@/src/lib/utils";

export interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}

function ColorSwatch({ color, selected = false, onClick, label }: ColorSwatchProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? color}
      aria-pressed={selected}
      className={cn(
        "h-7 w-7 rounded-full border-2 transition-transform",
        selected ? "border-primary-600 scale-110" : "border-white ring-1 ring-gray-200"
      )}
      style={{ backgroundColor: color }}
    />
  );
}

export default ColorSwatch;