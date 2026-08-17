"use client";

import ProductCard from "@/src/app/components/shared/ProductCard";
import { useCart } from "@/src/context/CartContext";
import { Product } from "@/src/lib/api-types";

interface TopRatedEssentialsProps {
  products: Product[];
}

export default function TopRatedEssentials({ products }: TopRatedEssentialsProps) {
  const { addItem } = useCart();

  if (products.length === 0) {
    return null; // nothing seeded yet — quietly omit the section rather than show an empty shell
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Top-Rated Essentials</h2>
        <p className="text-sm text-gray-500">Voted by our community of enthusiasts</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            href={`/products/${product.id}`}
            image={product.imageUrl ?? "/images/placeholder-product.jpg"}
            title={product.name}
            price={`R${Number(product.price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
            onAddToCart={() => addItem(product.id)}
          />
        ))}
      </div>
    </section>
  );
}