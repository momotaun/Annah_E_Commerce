"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import Badge from "@/src/app/components/ui/Badge";
import RatingStars from "@/src/app/components/ui/RatingStars";
import { cn } from "@/src/lib/utils";

export interface ProductCardProps {
  href: string;
  image: string;
  title: string;
  price: string;
  category?: string;
  description?: string;
  badge?: { label: string; variant?: "primary" | "warning" | "danger" };
  rating?: number;
  reviewCount?: number;
  showWishlist?: boolean;
  showQuickView?: boolean;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  className?: string;
}

function ProductCard({
  href,
  image,
  title,
  price,
  category,
  description,
  badge,
  rating,
  reviewCount,
  showWishlist = false,
  showQuickView = false,
  onAddToCart,
  onToggleWishlist,
  className,
}: ProductCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white",
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

        {showWishlist && (
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-label="Add to wishlist"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 hover:text-danger-500"
          >
            <Heart className="h-4 w-4" />
          </button>
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

        <Link href={href} className="text-base font-semibold text-gray-900 hover:text-primary-600">
          {title}
        </Link>

        {description && (
          <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        )}

        {rating !== undefined && (
          <RatingStars rating={rating} reviewCount={reviewCount} size="sm" />
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-primary-600">{price}</span>

          {onAddToCart && (
            <button
              type="button"
              onClick={onAddToCart}
              aria-label="Add to cart"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;