import Badge from "@/src/app/components/ui/Badge";
import { CLEARANCE_DISCOUNT_THRESHOLD } from "@/src/app/components/shared/ProductCard";
import { formatPrice, getDiscountPercent } from "@/src/lib/utils";

export interface PriceBlockProps {
  price: string;
  compareAtPrice?: string | null;
}

// Current price, plus the struck-through original price and a two-tier
// discount badge (orange sale, red clearance) when the product is marked down.
function PriceBlock({ price, compareAtPrice }: PriceBlockProps) {
  const discountPercent = getDiscountPercent(price, compareAtPrice);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={
          discountPercent !== null
            ? "text-3xl font-bold text-clearance"
            : "text-3xl font-bold text-ink"
        }
      >
        {formatPrice(price)}
      </span>
      {discountPercent !== null && (
        <>
          <span className="text-lg text-gray-400 line-through">{formatPrice(compareAtPrice!)}</span>
          <Badge
            variant={discountPercent >= CLEARANCE_DISCOUNT_THRESHOLD ? "discount" : "discountSale"}
            className="px-2.5 py-1"
          >
            {discountPercent}% off
          </Badge>
        </>
      )}
    </div>
  );
}

export default PriceBlock;
