import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import ProductCard from "@/src/app/components/shared/ProductCard";
import { getProducts } from "@/src/lib/api/products";

export default async function LookbookPage() {
  const { data: products } = await getProducts({ limit: 8 });

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900">The Lookbook</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            A curated edit of the pieces defining this season — technical excellence
            paired with everyday elegance.
          </p>
        </section>

        {products.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">
            Nothing curated yet — check back soon.
          </p>
        ) : (
          <section className="mx-auto max-w-7xl px-6 pb-16">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  href={`/products/${product.slug}`}
                  image={product.imageUrl ?? "/images/placeholder-product.jpg"}
                  title={product.name}
                  description={product.description ?? undefined}
                  price={`R${Number(product.price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
