import Badge from "@/src/app/components/ui/Badge";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import ProductCard from "@/src/app/components/shared/ProductCard";
import { getProducts } from "@/src/lib/api/products";

export default async function LimitedEditionCollectionPage() {
  const { data: products } = await getProducts({ limit: 8 });

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gray-900 px-6 py-20 text-center">
          <Badge variant="primary" className="mx-auto mb-4">LIMITED EDITION</Badge>
          <h1 className="text-4xl font-extrabold text-white">Up to 30% Off</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-gray-300">
            A limited run of our most sought-after pieces, discounted while stocks last.
          </p>
        </section>

        {products.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">
            This collection is currently empty — check back soon.
          </p>
        ) : (
          <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  href={`/products/${product.slug}`}
                  image={product.imageUrl ?? "/images/placeholder-product.jpg"}
                  title={product.name}
                  price={`R${Number(product.price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
                  badge={{ label: "Limited", variant: "danger" }}
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
