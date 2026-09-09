import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Vendor products can be saved with no price set yet (see CreateVendorProductDto),
// so every display site needs a null-safe formatter rather than `Number(price)`.
export function formatPrice(price: string | null): string {
  if (price === null) return "Price not set";
  return `R${Number(price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}