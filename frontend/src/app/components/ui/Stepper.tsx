"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

function Stepper({ value, onChange, min = 1, max = 99, className }: StepperProps) {
  return (
    <div className={cn("inline-flex items-center rounded-md border border-gray-200", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-primary-600 disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-base font-medium text-gray-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-primary-600 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default Stepper;