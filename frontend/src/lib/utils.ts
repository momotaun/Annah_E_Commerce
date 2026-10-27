import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string): string {
  return `R${Number(price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

/**
 * Whole-number percentage off for a product on sale, or null when it isn't:
 * compareAtPrice is the pre-discount "was" price and only counts when it is
 * greater than the current price.
 */
export function getDiscountPercent(
  price: string | number,
  compareAtPrice: string | number | null | undefined
): number | null {
  if (compareAtPrice === null || compareAtPrice === undefined) return null;
  const current = Number(price);
  const was = Number(compareAtPrice);
  if (!(was > current) || was <= 0) return null;
  return Math.round(((was - current) / was) * 100);
}
