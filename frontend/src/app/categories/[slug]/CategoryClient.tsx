"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import FilterSidebar, {
  PRICE_FLOOR,
  PRICE_CEILING,
} from "@/src/app/components/shared/FilterSidebar";
import ProductCard from "@/src/app/components/shared/ProductCard";
import Select from "@/src/app/components/ui/Select";
import Spinner from "@/src/app/components/ui/Spinner";
import { useCart } from "@/src/context/CartContext";
import { Category, PaginatedProducts } from "@/src/lib/api-types";
import { getProducts, ProductSort } from "@/src/lib/api/products";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

interface CategoryClientProps {
  category: Category;
  categories: Category[];
  initialProducts: PaginatedProducts;
  activeMinPrice?: number;
  activeMaxPrice?: number;
  activeSort?: ProductSort;
}

function flattenCategories(categories: Category[]) {
  const flat: { label: string; value: string }[] = [];
  for (const cat of categories) {
    flat.push({ label: cat.name, value: cat.slug });
    for (const child of cat.children) flat.push({ label: child.name, value: child.slug });
  }
  return flat;
}

export default function CategoryClient({
  category,
  categories,
  initialProducts,
  activeMinPrice,
  activeMaxPrice,
  activeSort,
}: CategoryClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState(initialProducts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // See CatalogueClient's identical effect for why this is needed: a
  // fresh initialProducts prop on every category/price/sort navigation
  // doesn't reset useState's already-mounted value on its own, and this
  // also resets the accumulated infinite-scroll list back to the new
  // filter's first page.
  useEffect(() => {
    const timer = setTimeout(() => setProducts(initialProducts), 0);
    return () => clearTimeout(timer);
  }, [initialProducts]);

  // Infinite scroll, matching the design (a "Loading more premium
  // products..." indicator, not numbered pages or prev/next buttons).
  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current) return;
    if (products.data.length >= products.meta.total) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const result = await getProducts({
        category: category.slug,
        minPrice: activeMinPrice,
        maxPrice: activeMaxPrice,
        sort: activeSort,
        page: products.meta.page + 1,
        limit: 12,
      });
      setProducts((prev) => ({
        data: [...prev.data, ...result.data],
        meta: result.meta,
      }));
    } catch (err) {
      console.error("Failed to load more products", err);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [products, category.slug, activeMinPrice, activeMaxPrice, activeSort]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  function handleCategoryChange(slug: string, checked: boolean) {
    startTransition(() => {
      router.push(checked ? `/categories/${slug}` : "/catalogue");
    });
  }

  function handlePriceChange(min: number, max: number) {
    const params = new URLSearchParams(window.location.search);
    if (min > PRICE_FLOOR) {
      params.set("minPrice", String(min));
    } else {
      params.delete("minPrice");
    }
    if (max < PRICE_CEILING) {
      params.set("maxPrice", String(max));
    } else {
      params.delete("maxPrice");
    }
    startTransition(() => {
      router.push(`/categories/${category.slug}?${params.toString()}`);
    });
  }

  function handleSortChange(sort: ProductSort) {
    const params = new URLSearchParams(window.location.search);
    if (sort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    startTransition(() => {
      router.push(`/categories/${category.slug}?${params.toString()}`);
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Catalogue", href: "/catalogue" },
            { label: category.name },
          ]}
        />

        <section className="relative mt-4 flex min-h-[200px] items-center overflow-hidden rounded-md bg-gray-900 px-8">
          <div className="relative max-w-lg text-white">
            <h1 className="text-4xl font-extrabold">{category.name}</h1>
            {/* No description field exists on Category in our schema —
                the original hero copy was entirely hardcoded placeholder
                text, so it's omitted here rather than faked per category. */}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-8 md:flex-row">
          <FilterSidebar
            categories={flattenCategories(categories)}
            brands={[]}
            selectedCategories={[category.slug]}
            onCategoryChange={handleCategoryChange}
            minPrice={activeMinPrice}
            maxPrice={activeMaxPrice}
            onPriceChange={handlePriceChange}
          />

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {products.data.length} of {products.meta.total} products
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select
                  options={SORT_OPTIONS}
                  value={activeSort ?? "newest"}
                  onChange={(e) => handleSortChange(e.target.value as ProductSort)}
                  className="w-40"
                />
              </div>
            </div>

            {isPending ? (
              <div className="flex justify-center py-16">
                <Spinner label="Loading products..." />
              </div>
            ) : products.data.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-500">
                No products in this category yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {products.data.map((product) => (
                  <ProductCard
                    key={product.id}
                    href={`/products/${product.slug}`}
                    image={product.imageUrl ?? "/images/placeholder-product.jpg"}
                    title={product.name}
                    description={product.description ?? undefined}
                    price={`R${Number(product.price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
                    onAddToCart={() => addItem(product.id)}
                  />
                ))}
              </div>
            )}

            {products.data.length < products.meta.total && (
              <div ref={sentinelRef} className="mt-8 flex justify-center py-8">
                {isLoadingMore && (
                  <Spinner size="sm" label="Loading more premium products..." />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}