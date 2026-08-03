"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import FilterSidebar from "@/src/app/components/shared/FilterSidebar";
import ProductCard from "@/src/app/components/shared/ProductCard";
import Select from "@/src/app/components/ui/Select";
import Spinner from "@/src/app/components/ui/Spinner";
import { useCart } from "@/src/context/CartContext";
import { Category, PaginatedProducts } from "@/src/lib/api-types";

interface CategoryClientProps {
  category: Category;
  categories: Category[];
  products: PaginatedProducts;
}

function flattenCategories(categories: Category[]) {
  const flat: { label: string; value: string }[] = [];
  for (const cat of categories) {
    flat.push({ label: cat.name, value: cat.slug });
    for (const child of cat.children) flat.push({ label: child.name, value: child.slug });
  }
  return flat;
}

export default function CategoryClient({ category, categories, products }: CategoryClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();

  function handleCategoryChange(slug: string, checked: boolean) {
    startTransition(() => {
      router.push(checked ? `/categories/${slug}` : "/catalogue");
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
          />

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {products.data.length} of {products.meta.total} products
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select
                  options={[{ label: "Newest", value: "newest" }]}
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
                    href={`/products/${product.id}`}
                    image={product.imageUrl ?? "/images/placeholder-product.jpg"}
                    title={product.name}
                    description={product.description ?? undefined}
                    price={`R${Number(product.price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
                    onAddToCart={() => addItem(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer
        brandBlurb="Your premier destination for the world's most advanced electronics and lifestyle technology."
        columns={[
          { title: "Shop Categories", links: flattenCategories(categories).slice(0, 4).map((c) => ({ label: c.label, href: `/categories/${c.value}` })) },
          { title: "Company", links: [{ label: "About Us", href: "/about" }, { label: "Contact", href: "/contact" }] },
        ]}
      />
    </div>
  );
}