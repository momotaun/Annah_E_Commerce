"use client";

import ProductCard, { ProductCardProps } from "./ProductCard";
import { useWishlist } from "@/src/context/WishlistContext";

// A thin client wrapper around ProductCard for pages that fetch their
// product data server-side (no "use client" of their own, so they can't
// call useWishlist directly) but still want a working wishlist heart.
interface ProductCardWithWishlistProps extends Omit<ProductCardProps, "isWishlisted" | "onToggleWishlist"> {
  productId: string;
}

export default function ProductCardWithWishlist({
  productId,
  ...props
}: ProductCardWithWishlistProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();

  return (
    <ProductCard
      {...props}
      isWishlisted={isWishlisted(productId)}
      onToggleWishlist={() => toggleWishlist(productId)}
    />
  );
}
