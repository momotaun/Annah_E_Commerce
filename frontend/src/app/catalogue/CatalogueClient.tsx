"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import FilterSidebar, {
  PRICE_FLOOR,
  PRICE_CEILING,
} from "@/src/app/components/shared/FilterSidebar";
import SearchBar from "@/src/app/components/shared/SearchBar";
import ProductCard from "@/src/app/components/shared/ProductCard";
import Select from "@/src/app/components/ui/Select";
import Spinner from "@/src/app/components/ui/Spinner";
import { useCart } from "@/src/context/CartContext";
import { Category, PaginatedProducts } from "@/src/lib/api-types";
import { getProducts, ProductSort, searchProducts } from "@/src/lib/api/products";

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

interface CatalogueClientProps {
  initialProducts: PaginatedProducts;
  categories: Category[];
  activeCategory?: string;
  activeMinPrice?: number;
  activeMaxPrice?: number;
  activeSort?: ProductSort;
}

// Flatten the category tree into a flat list for the sidebar's checkbox
// group — FilterSidebar expects { label, value } pairs, not a nested tree.
function flattenCategories(categories: Category[]): { label: string; value: string }[] {
  const flat: { label: string; value: string }[] = [];
  for (const cat of categories) {
    flat.push({ label: cat.name, value: cat.slug });
    for (const child of cat.children) {
      flat.push({ label: child.name, value: child.slug });
    }
  }
  return flat;
}

export default function CatalogueClient({
  initialProducts,
  categories,
  activeCategory,
  activeMinPrice,
  activeMaxPrice,
  activeSort,
}: CatalogueClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState(initialProducts);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Tracks the active search term so a sort change while searching
  // re-runs the search with the new sort instead of navigating the URL
  // (search itself is a client-side fetch, not URL-driven, so sort
  // stays consistent with that while a query is active).
  const [currentQuery, setCurrentQuery] = useState("");
  // Guards loadMore against firing twice for the same page — a plain ref
  // rather than isLoadingMore state, since the IntersectionObserver
  // callback below closes over whatever this was when the observer was
  // last (re)created, and re-creating it on every isLoadingMore change
  // would be unnecessary churn. The ref is always read fresh.
  const isLoadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // initialProducts is a fresh server-fetched prop on every category/
  // price/sort/search-cleared navigation (router.push re-renders the
  // server component with the new searchParams) — but useState's initial
  // value is only used on first mount, so without this the grid would
  // keep showing whatever was first rendered no matter what filter
  // changed the URL. This also resets the accumulated infinite-scroll
  // list back to just the new filter's first page, which is exactly
  // what should happen when the filter itself changes.
  useEffect(() => {
    const timer = setTimeout(() => setProducts(initialProducts), 0);
    return () => clearTimeout(timer);
  }, [initialProducts]);

  // Infinite scroll, matching the design (a "Loading more premium
  // products..." indicator, not numbered pages or prev/next buttons):
  // appends the next page to the existing list instead of replacing it.
  // Recreated whenever the product list or active filters change, so the
  // observer effect below always reconnects with a fresh closure instead
  // of one still holding page/filter values from an earlier render.
  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current) return;
    if (products.data.length >= products.meta.total) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    const nextPage = products.meta.page + 1;
    try {
      const result = currentQuery
        ? await searchProducts(currentQuery, nextPage, 20, activeSort)
        : await getProducts({
            category: activeCategory,
            minPrice: activeMinPrice,
            maxPrice: activeMaxPrice,
            sort: activeSort,
            page: nextPage,
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
  }, [products, currentQuery, activeCategory, activeMinPrice, activeMaxPrice, activeSort]);

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

  const categoryOptions = flattenCategories(categories);

  function handleCategoryChange(slug: string, checked: boolean) {
    const params = new URLSearchParams(window.location.search);
    if (checked) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    startTransition(() => {
      router.push(`/catalogue?${params.toString()}`);
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
      router.push(`/catalogue?${params.toString()}`);
    });
  }

  async function handleSearch(query: string) {
    setCurrentQuery(query);
    if (!query) {
      setProducts(initialProducts);
      return;
    }
    setIsSearching(true);
    try {
      const result = await searchProducts(query, 1, 20, activeSort);
      setProducts(result);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSortChange(sort: ProductSort) {
    if (currentQuery) {
      setIsSearching(true);
      try {
        const result = await searchProducts(currentQuery, 1, 20, sort);
        setProducts(result);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (sort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    startTransition(() => {
      router.push(`/catalogue?${params.toString()}`);
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 md:flex-row">
        <FilterSidebar
          categories={categoryOptions}
          brands={[]}
          selectedCategories={activeCategory ? [activeCategory] : []}
          onCategoryChange={handleCategoryChange}
          minPrice={activeMinPrice}
          maxPrice={activeMaxPrice}
          onPriceChange={handlePriceChange}
        />

        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar placeholder="Search products..." onSearch={handleSearch} className="sm:max-w-sm" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select
                options={SORT_OPTIONS}
                value={activeSort ?? "newest"}
                onChange={(e) => handleSortChange(e.target.value as ProductSort)}
                className="w-48"
              />
            </div>
          </div>

          {isPending || isSearching ? (
            <div className="flex justify-center py-16">
              <Spinner label="Loading products..." />
            </div>
          ) : products.data.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500">
              No products found.
            </p>
          ) : (
            // This grid shares the row with the filter sidebar (unlike the
            // sidebar-less grids elsewhere, e.g. TopRatedEssentials), so it
            // needs more width per breakpoint than a full-width grid does.
            // Verified live: even 3 columns at md (768px) only leaves ~50px
            // for the price text next to the cart button — not enough for
            // "R45 999,00"-length prices, which got hard-clipped against
            // the card's overflow-hidden. 3 columns doesn't have room
            // until lg (1024px); 4 waits until xl.
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.data.map((product) => (
                <ProductCard
                  key={product.id}
                  href={`/products/${product.slug}`}
                  image={product.imageUrl ?? "/images/placeholder-product.jpg"}
                  title={product.name}
                  price={`R${Number(product.price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
                  showWishlist
                  showQuickView
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
      </main>

      <Footer />
    </div>
  );
}