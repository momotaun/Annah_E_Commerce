import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  showCount?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { star: "h-3.5 w-3.5", text: "text-xs" },
  md: { star: "h-4 w-4", text: "text-sm" },
  lg: { star: "h-5 w-5", text: "text-base" },
};

function RatingStars({
  rating,
  reviewCount,
  size = "md",
  showValue = true,
  showCount = true,
  className,
}: RatingStarsProps) {
  const { star, text } = sizeMap[size];
  const roundedRating = Math.round(rating);

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              star,
              i < roundedRating
                ? "fill-warning-500 text-warning-500"
                : "fill-gray-100 text-gray-200"
            )}
          />
        ))}
      </div>

      {showValue && (
        <span className={cn(text, "font-semibold text-gray-900")}>
          {rating.toFixed(1)}
        </span>
      )}

      {showCount && reviewCount !== undefined && (
        <span className={cn(text, "text-gray-500")}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

export default RatingStars;