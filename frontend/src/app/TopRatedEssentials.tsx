"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/src/app/components/shared/ProductCard";
import { useCart } from "@/src/context/CartContext";
import { Product } from "@/src/lib/api-types";
import { formatPrice } from "@/src/lib/utils";

interface TopRatedEssentialsProps {
  products: Product[];
}

export default function TopRatedEssentials({ products }: TopRatedEssentialsProps) {
  const { addItem } = useCart();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function updateScrollState() {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products]);

  if (products.length === 0) {
    return null; // nothing seeded yet — quietly omit the section rather than show an empty shell
  }

  function scrollByPage(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * scrollerRef.current.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deals Worth Seeing</h2>
          <p className="text-sm text-gray-500">Popular products, loved by our customers.</p>
        </div>
        <Link
          href="/collections/limited-edition"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 hover:underline"
        >
          See all deals
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll products left"
          className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-1"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[45vw] shrink-0 snap-start sm:w-52">
              <ProductCard
                href={`/products/${product.slug}`}
                image={product.imageUrl ?? "/images/placeholder-product.jpg"}
                title={product.name}
                vendor={product.vendor}
                price={formatPrice(product.price)}
                showWishlist
                onAddToCart={() => addItem(product.id)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByPage(1)}
          disabled={!canScrollRight}
          aria-label="Scroll products right"
          className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}