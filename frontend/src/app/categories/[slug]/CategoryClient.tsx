"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import CategoryBanner from "@/src/app/components/shared/CategoryBanner";
import CategoryTree from "@/src/app/components/shared/CategoryTree";
import FilterSidebar, {
  PRICE_FLOOR,
  PRICE_CEILING,
} from "@/src/app/components/shared/FilterSidebar";
import PriceChips from "@/src/app/components/shared/PriceChips";
import ProductCard from "@/src/app/components/shared/ProductCard";
import Select from "@/src/app/components/ui/Select";
import Spinner from "@/src/app/components/ui/Spinner";
import ViewToggle, { ProductView } from "@/src/app/components/ui/ViewToggle";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { Category, PaginatedProducts } from "@/src/lib/api-types";
import { getProducts, ProductSort } from "@/src/lib/api/products";
import { getCategoryImage } from "@/src/lib/categoryImages";
import { formatPrice, getDiscountPercent } from "@/src/lib/utils";

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
  activeSegments?: string[];
  activeDelivery?: string[];
  activeMinRating?: number;
  activeVerifiedOnly?: boolean;
}

export default function CategoryClient({
  category,
  categories,
  initialProducts,
  activeMinPrice,
  activeMaxPrice,
  activeSort,
  activeSegments = [],
  activeDelivery = [],
  activeMinRating,
  activeVerifiedOnly = false,
}: CategoryClientProps) {
  const router = useRouter();
  const { cart, setProductQuantity } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState(initialProducts);
  const [view, setView] = useState<ProductView>("grid");
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
        segment: activeSegments.length ? activeSegments.join(",") : undefined,
        delivery: activeDelivery.length ? activeDelivery.join(",") : undefined,
        minRating: activeMinRating,
        verifiedOnly: activeVerifiedOnly,
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
  }, [
    products,
    category.slug,
    activeMinPrice,
    activeMaxPrice,
    activeSort,
    activeSegments,
    activeDelivery,
    activeMinRating,
    activeVerifiedOnly,
  ]);

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

  function pushParam(key: string, value: string | null) {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/categories/${category.slug}?${params.toString()}`);
    });
  }

  function handleSegmentChange(value: string, checked: boolean) {
    const next = checked
      ? [...new Set([...activeSegments, value])]
      : activeSegments.filter((s) => s !== value);
    pushParam("segment", next.length ? next.join(",") : null);
  }

  function handleDeliveryChange(value: string, checked: boolean) {
    const next = checked
      ? [...new Set([...activeDelivery, value])]
      : activeDelivery.filter((d) => d !== value);
    pushParam("delivery", next.length ? next.join(",") : null);
  }

  function handleVerifiedOnlyChange(checked: boolean) {
    pushParam("verifiedOnly", checked ? "true" : null);
  }

  function handleMinRatingChange(checked: boolean) {
    pushParam("minRating", checked ? "4" : null);
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

        <div className="mt-4">
          <CategoryBanner
            name={category.name}
            productCount={products.meta.total}
            image={getCategoryImage(category.slug)}
          />
        </div>

        <div className="mt-8 flex flex-col gap-8 md:flex-row">
          <div className="flex w-full flex-col gap-8 md:w-56 md:shrink-0">
            <CategoryTree categories={categories} activeSlug={category.slug} />
            <FilterSidebar
              categories={[]}
              brands={[]}
              selectedCategories={[category.slug]}
              onCategoryChange={() => {}}
              minPrice={activeMinPrice}
              maxPrice={activeMaxPrice}
              onPriceChange={handlePriceChange}
              hidePrice
              selectedSegments={activeSegments}
              onSegmentChange={handleSegmentChange}
              selectedDelivery={activeDelivery}
              onDeliveryChange={handleDeliveryChange}
              verifiedOnly={activeVerifiedOnly}
              onVerifiedOnlyChange={handleVerifiedOnlyChange}
              minRating={activeMinRating}
              onMinRatingChange={handleMinRatingChange}
            />
          </div>

          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-3">
              <PriceChips
                minPrice={activeMinPrice}
                maxPrice={activeMaxPrice}
                onChange={handlePriceChange}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing {products.data.length} of {products.meta.total} products
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <Select
                    options={SORT_OPTIONS}
                    value={activeSort ?? "newest"}
                    onChange={(e) => handleSortChange(e.target.value as ProductSort)}
                    className="w-40"
                  />
                  <ViewToggle value={view} onChange={setView} />
                </div>
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
              // sm:grid-cols-2 is safe below md since the sidebar still
              // stacks above the grid there (md:flex-row below) — full
              // page width, no contention. Once the sidebar sits beside
              // the grid at md (768px) though, 3 columns leaves only
              // ~50px for the price next to the cart button, clipping
              // longer prices (verified live) — same issue as the
              // Catalogue grid, same fix: wait for lg.
              <div
                className={
                  view === "list"
                    ? "flex flex-col gap-4"
                    : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }
              >
                {products.data.map((product) => (
                  <ProductCard
                    key={product.id}
                    href={`/products/${product.slug}`}
                    image={product.imageUrl ?? "/images/placeholder-product.jpg"}
                    title={product.name}
                    vendor={product.vendor}
                    description={product.description ?? undefined}
                    price={formatPrice(product.price)}
                    layout={view}
                    originalPrice={
                      getDiscountPercent(product.price, product.compareAtPrice) !== null
                        ? formatPrice(product.compareAtPrice!)
                        : undefined
                    }
                    discountPercent={getDiscountPercent(product.price, product.compareAtPrice) ?? undefined}
                    showWishlist
                    isWishlisted={isWishlisted(product.id)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                    quantity={cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0}
                    onQuantityChange={(quantity) => setProductQuantity(product.id, quantity)}
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