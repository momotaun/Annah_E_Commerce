import Link from "next/link";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import { getCategories } from "@/src/lib/api/categories";

const CARD_GRADIENTS = [
  "from-primary-700 to-primary-500",
  "from-gray-800 to-gray-600",
  "from-slate-700 to-slate-500",
  "from-zinc-800 to-zinc-600",
];

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />

        <div className="mt-4 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">All Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse our full range of curated collections
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">
            No categories available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={`relative flex min-h-[160px] flex-col justify-end overflow-hidden rounded-md bg-gradient-to-br p-5 text-white ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
              >
                <span className="text-lg font-semibold">{category.name}</span>

                {category.children.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-white/80">
                    {category.children.slice(0, 4).map((child) => (
                      <span key={child.id}>{child.name}</span>
                    ))}
                    {category.children.length > 4 && (
                      <span>+{category.children.length - 4} more</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer
        brandBlurb="Elevating everyday life through curated premium essentials. Your destination for high-end lifestyle and tech products."
        columns={[
          { title: "Shop", links: [{ label: "Catalogue", href: "/catalogue" }, { label: "Featured Items", href: "/featured" }, { label: "New Arrivals", href: "/new" }, { label: "Promotions", href: "/promotions" }] },
          { title: "Company", links: [{ label: "About Us", href: "/about" }, { label: "Sustainability", href: "/sustainability" }, { label: "Contact", href: "/contact" }, { label: "Careers", href: "/careers" }] },
        ]}
      />
    </div>
  );
}
