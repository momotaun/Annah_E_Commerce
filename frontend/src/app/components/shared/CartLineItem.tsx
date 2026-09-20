"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import Stepper from "@/src/app/components/ui/Stepper";

export interface CartLineItemProps {
  image: string;
  title: string;
  variant?: string;
  price: string;
  quantity: number;
  vendor?: { businessName: string; verified: boolean } | null;
  deliveryOption?: string | null;
  onQuantityChange: (quantity: number) => void;
  onRemove?: () => void;
  showWishlist?: boolean;
  onToggleWishlist?: () => void;
}

const DELIVERY_LABEL: Record<string, string> = {
  NEXT_DAY: "Delivery tomorrow",
  TWO_DAY: "Delivery in 2 days",
  COLLECTION: "Available for collection",
};

function CartLineItem({
  image,
  title,
  variant,
  price,
  quantity,
  vendor,
  deliveryOption,
  onQuantityChange,
  onRemove,
  showWishlist = false,
  onToggleWishlist,
}: CartLineItemProps) {
  const deliveryLabel = deliveryOption ? DELIVERY_LABEL[deliveryOption] : undefined;

  return (
    <div className="flex items-start gap-4 border-b border-amber-100 py-5 last:border-b-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-amber-50">
        <Image src={image} alt={title} fill className="object-cover" />
        {showWishlist && (
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-label="Add to wishlist"
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-500 hover:text-danger-500"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* min-w-0 overrides flex items' default min-width:auto — without it,
          a long product name refuses to wrap and pushes the price/remove
          column off the right edge on narrow screens instead of shrinking. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        {variant && <p className="text-sm text-gray-500">{variant}</p>}

        {vendor && (
          <p className="flex items-center gap-2 text-sm">
            <span className="font-medium text-primary-600">Sold by {vendor.businessName}</span>
            {vendor.verified && <span className="font-medium text-primary-600">Verified</span>}
          </p>
        )}

        {deliveryLabel && (
          <p className="text-sm text-gray-500">{deliveryLabel} · Free delivery</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-lg font-bold text-gray-900">{price}</span>
        <Stepper
          value={quantity}
          onChange={onQuantityChange}
          min={1}
          className="rounded-full border-amber-200 bg-amber-50"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-danger-500 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default CartLineItem;
