import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import ProductCard from "@/src/app/components/shared/ProductCard";
import { ApiError } from "@/src/lib/api-client";
import { getVendor } from "@/src/lib/api/vendors";
import { getProducts } from "@/src/lib/api/products";

function getInitials(businessName: string) {
  return businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default async function VendorStorefrontPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await getVendor(id).catch((error) => {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  });

  if (!vendor) {
    notFound();
  }

  const { data: products } = await getProducts({ vendorId: vendor.id, limit: 24 });

  const initials = getInitials(vendor.businessName);
  const joinedYear = vendor.approvedAt
    ? new Date(vendor.approvedAt).getFullYear()
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-6 pt-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: vendor.businessName }]} />
        </div>

        <section className="relative mt-4 overflow-hidden bg-gray-900">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/10 bg-white/10 text-2xl font-bold text-white">
              {initials}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold text-white">{vendor.businessName}</h1>
                <BadgeCheck className="h-6 w-6 text-primary-300" aria-label="Approved Vendor" />
              </div>
              {vendor.bio && (
                <p className="max-w-2xl text-sm text-gray-300">{vendor.bio}</p>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
              <div className="flex flex-col items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-300">Products</span>
                <span className="text-xl font-bold text-white">{vendor.productCount}</span>
              </div>
              {joinedYear && (
                <div className="flex flex-col items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-300">Joined</span>
                  <span className="text-xl font-bold text-white">{joinedYear}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          {products.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500">
              This vendor hasn&apos;t listed any products yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
