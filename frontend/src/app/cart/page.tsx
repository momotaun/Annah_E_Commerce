"use client";

import { ArrowLeft, Lock, Info } from "lucide-react";
import Link from "next/link";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import CartLineItem from "@/src/app/components/shared/CartLineItem";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import { useCart } from "@/src/context/CartContext";

export default function ShoppingCartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart();

  const items = cart?.items ?? [];
  const subtotal = cart ? Number(cart.subtotal) : 0;
  // Tax/shipping aren't modeled anywhere in our Phase 1 Cart API — the
  // subtotal from the backend is the only real figure we have. Shown as
  // "Calculate" / omitted rather than fabricating numbers client-side.

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        navLinks={[
          { label: "Home", href: "/" },
          { label: "Catalogue", href: "/catalogue" },
          { label: "Categories", href: "/categories" },
        ]}
        showSearch
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Your Shopping Cart" }]} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Shopping Cart</h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner label="Loading your cart..." />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">Your cart is empty.</p>
            <Button href="/catalogue" className="mt-4">Continue Shopping</Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-md border border-gray-200 bg-white px-6">
                {items.map((item) => (
                  <CartLineItem
                    key={item.id}
                    image={item.product.imageUrl ?? "/images/placeholder-product.jpg"}
                    title={item.product.name}
                    price={`R${Number(item.lineTotal).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
                    quantity={item.quantity}
                    onQuantityChange={(qty) => updateItem(item.id, qty)}
                  />
                ))}
              </div>

              <Link
                href="/catalogue"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-md border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

                <div className="mt-4 flex flex-col gap-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900">
                      R{subtotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className="font-medium text-primary-600">Calculate</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    R{subtotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Button fullWidth className="mt-4" href="/checkout">
                  Proceed to Checkout
                </Button>

                <div className="mt-4 flex gap-2 rounded-md bg-gray-50 p-3 text-xs text-gray-500">
                  <Info className="h-4 w-4 shrink-0 text-gray-400" />
                  Checkout requires an account.{" "}
                  <Link href="/login" className="font-medium text-primary-600 hover:underline">
                    Log in
                  </Link>{" "}
                  to complete your purchase.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}