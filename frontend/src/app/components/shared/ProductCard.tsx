"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import Badge from "@/src/app/components/ui/Badge";
import RatingStars from "@/src/app/components/ui/RatingStars";
import Stepper from "@/src/app/components/ui/Stepper";
import { cn } from "@/src/lib/utils";

// No rating/review data exists in the schema — this generates a stable,
// believable-looking rating per product (seeded from its href, so it never
// shifts between renders) rather than showing every card as unrated.
function mockRating(seed: string): { rating: number; reviewCount: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return {
    rating: 4 + ((hash % 11) / 10), // 4.0 – 5.0 in 0.1 steps
    reviewCount: 8 + (hash % 250), // 8 – 257
  };
}

export interface ProductCardProps {
  href: string;
  image: string;
  title: string;
  price: string;
  category?: string;
  /** Renders a "by <name>" link to the vendor's storefront under the title. */
  vendor?: { id: string; businessName: string } | null;
  description?: string;
  badge?: { label: string; variant?: "primary" | "warning" | "danger" };
  /** Whole-number percentage off, e.g. 20 for "20% off" — renders a pill next to the wishlist heart. */
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  showQuickView?: boolean;
  /** Current quantity of this product in the cart. Paired with
      onQuantityChange, renders a plain Add to Cart button until quantity is
      at least 1, then swaps to a quantity selector. */
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  onToggleWishlist?: () => void;
  className?: string;
}

function ProductCard({
  href,
  image,
  title,
  price,
  category,
  vendor,
  description,
  badge,
  discountPercent,
  rating,
  reviewCount,
  showWishlist = false,
  isWishlisted = false,
  showQuickView = false,
  quantity,
  onQuantityChange,
  onToggleWishlist,
  className,
}: ProductCardProps) {
  const fallbackRating = mockRating(href);
  const displayRating = rating ?? fallbackRating.rating;
  const displayReviewCount = reviewCount ?? fallbackRating.reviewCount;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white",
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Link href={href}>
          <Image src={image} alt={title} fill className="object-cover" />
        </Link>

        {badge && (
          <Badge variant={badge.variant ?? "primary"} className="absolute left-4 top-4 z-10">
            {badge.label}
          </Badge>
        )}

        {(showWishlist || (discountPercent !== undefined && discountPercent > 0)) && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
            {discountPercent !== undefined && discountPercent > 0 && (
              <span className="flex h-9 items-center justify-center rounded-full bg-danger-500 px-3 text-sm font-bold text-white">
                -{discountPercent}%
              </span>
            )}

            {showWishlist && (
              <button
                type="button"
                onClick={onToggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 hover:text-danger-500",
                  isWishlisted ? "text-danger-500" : "text-gray-500"
                )}
              >
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              </button>
            )}
          </div>
        )}

        {showQuickView && (
          <Link
            href={href}
            className="absolute inset-x-0 bottom-0 flex h-9 items-center justify-center bg-primary-600 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            Quick View
          </Link>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {category && (
          <span className="text-xs font-medium uppercase text-gray-500">
            {category}
          </span>
        )}

        {vendor && (
          <Link
            href={`/vendors/${vendor.id}`}
            className="w-fit text-[11px] font-light uppercase tracking-wide text-gray-500 hover:text-primary-600 hover:underline"
          >
            by {vendor.businessName}
          </Link>
        )}

        <Link
          href={href}
          title={title}
          className="block truncate text-base font-semibold text-gray-900 hover:text-primary-600"
        >
          {title}
        </Link>

        {description && (
          <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        )}

        <RatingStars rating={displayRating} reviewCount={displayReviewCount} size="sm" />

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {/* min-w-0 overrides this flex item's default min-width:auto —
              without it, a wide price (e.g. "R1 599,00") refuses to
              shrink and gets hard-clipped by the card's overflow-hidden
              at narrower grid widths (verified at the 4-up tablet grid).
              truncate is a fallback ellipsis for anything still too tight. */}
          <span className="min-w-0 flex-1 truncate text-lg font-bold text-orange-950">
            {price}
          </span>

          {onQuantityChange &&
            (quantity && quantity > 0 ? (
              <Stepper value={quantity} onChange={onQuantityChange} min={0} size="sm" className="shrink-0" />
            ) : (
              <button
                type="button"
                onClick={() => onQuantityChange(1)}
                aria-label="Add to cart"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;