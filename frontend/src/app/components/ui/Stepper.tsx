"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** "sm" fits tighter spaces like a product card's price row. */
  size?: "sm" | "md";
  className?: string;
}

const sizeMap = {
  sm: { button: "h-7 w-7", icon: "h-3 w-3", value: "w-6 text-sm" },
  md: { button: "h-10 w-10", icon: "h-4 w-4", value: "w-8 text-base" },
};

function Stepper({ value, onChange, min = 1, max = 99, size = "md", className }: StepperProps) {
  const { button, icon, value: valueClass } = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center rounded-md border border-gray-200", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn("flex items-center justify-center text-gray-500 hover:text-primary-600 disabled:opacity-40", button)}
      >
        <Minus className={icon} />
      </button>
      <span className={cn("text-center font-medium text-gray-900", valueClass)}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn("flex items-center justify-center text-gray-500 hover:text-primary-600 disabled:opacity-40", button)}
      >
        <Plus className={icon} />
      </button>
    </div>
  );
}

export default Stepper;