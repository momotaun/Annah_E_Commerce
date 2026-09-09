"use client";

import ProductCard from "@/src/app/components/shared/ProductCard";
import { useCart } from "@/src/context/CartContext";
import { Product } from "@/src/lib/api-types";
import { formatPrice } from "@/src/lib/utils";

interface TopRatedEssentialsProps {
  products: Product[];
}

// Matches the reference design's single row of 6 — sliced rather than
// fetched at 6 upstream so this stays the one place that decides how many
// fit a row.
const ROW_SIZE = 6;

export default function TopRatedEssentials({ products }: TopRatedEssentialsProps) {
  const { addItem } = useCart();

  if (products.length === 0) {
    return null; // nothing seeded yet — quietly omit the section rather than show an empty shell
  }

  const rowProducts = products.slice(0, ROW_SIZE);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
        <p className="text-sm text-gray-500">Popular products, loved by our customers.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {rowProducts.map((product) => (
          <ProductCard
            key={product.id}
            href={`/products/${product.slug}`}
            image={product.imageUrl ?? "/images/placeholder-product.jpg"}
            title={product.name}
            price={formatPrice(product.price)}
            onAddToCart={() => addItem(product.id)}
          />
        ))}
      </div>
    </section>
  );
}