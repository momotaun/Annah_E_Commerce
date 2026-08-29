"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import FilterSidebar from "@/src/app/components/shared/FilterSidebar";
import SearchBar from "@/src/app/components/shared/SearchBar";
import ProductCard from "@/src/app/components/shared/ProductCard";
import Select from "@/src/app/components/ui/Select";
import Spinner from "@/src/app/components/ui/Spinner";
import { useCart } from "@/src/context/CartContext";
import { Category, PaginatedProducts } from "@/src/lib/api-types";
import { searchProducts } from "@/src/lib/api/products";

interface CatalogueClientProps {
  initialProducts: PaginatedProducts;
  categories: Category[];
  activeCategory?: string;
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
}: CatalogueClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState(initialProducts);
  const [isSearching, setIsSearching] = useState(false);

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

  async function handleSearch(query: string) {
    if (!query) {
      setProducts(initialProducts);
      return;
    }
    setIsSearching(true);
    try {
      const result = await searchProducts(query);
      setProducts(result);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
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
        />

        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar placeholder="Search products..." onSearch={handleSearch} className="sm:max-w-sm" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select
                options={[
                  { label: "Newest Arrivals", value: "newest" },
                  { label: "Price: Low to High", value: "price-asc" },
                  { label: "Price: High to Low", value: "price-desc" },
                ]}
                className="w-48"
              />
              {/* Sorting isn't supported by our /api/products endpoint yet
                  (no ?sort= param documented) — selector is present for
                  visual parity but not yet wired to a real request. */}
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

          {products.meta.totalPages > 1 && (
            <p className="mt-8 text-center text-sm text-gray-500">
              Page {products.meta.page} of {products.meta.totalPages}
              {/* Real pagination controls (prev/next buttons) are a
                  follow-up — meta is available, just not wired to UI yet. */}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}