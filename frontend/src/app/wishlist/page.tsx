"use client";

import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import ProductCard from "@/src/app/components/shared/ProductCard";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { formatPrice } from "@/src/lib/utils";

export default function WishlistPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { items, isLoading, toggleWishlist } = useWishlist();
  const { cart, setProductQuantity } = useCart();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Your Wishlist</h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner label="Loading your wishlist..." />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">
              Nothing saved yet — tap the heart on any product to add it here.
            </p>
            <Button href="/catalogue" className="mt-4">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                href={`/products/${item.product.slug}`}
                image={item.product.imageUrl ?? "/images/placeholder-product.jpg"}
                title={item.product.name}
                vendor={item.product.vendor}
                price={formatPrice(item.product.price)}
                showWishlist
                isWishlisted
                onToggleWishlist={() => toggleWishlist(item.productId)}
                quantity={cart?.items.find((ci) => ci.productId === item.productId)?.quantity ?? 0}
                onQuantityChange={(quantity) => setProductQuantity(item.productId, quantity)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
