"use client";

import { useState } from "react";
import { ArrowLeft, Lock, Info } from "lucide-react";
import Link from "next/link";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import CartLineItem from "@/src/app/components/shared/CartLineItem";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";

const initialItems = [
  { id: "1", title: "Apex Pro Precision Keyboard", variant: "Carbon Grey / Brown Switches", price: 189.0, image: "/images/keyboard5.jpg", quantity: 1 },
  { id: "2", title: "SonicWave Studio Headphones", variant: "Color: Lunar Silver", price: 349.5, image: "/images/headphones4.jpg", quantity: 1 },
  { id: "3", title: "Apex Connect Pro Hub", variant: "Edition: 7-in-1 Aluminum", price: 79.0, image: "/images/hub.jpg", quantity: 1 },
];

export default function ShoppingCartPage() {
  const [items, setItems] = useState(initialItems);
  const [promoCode, setPromoCode] = useState("");

  function updateQuantity(id: string, quantity: number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        navLinks={[
          { label: "Home", href: "/" },
          { label: "Catalogue", href: "/catalogue" },
          { label: "Categories", href: "/categories" },
        ]}
        showSearch
        cartCount={items.length}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Your Shopping Cart" },
          ]}
        />

        <h1 className="mt-4 text-3xl font-bold text-gray-900">Shopping Cart</h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-md border border-gray-200 bg-white px-6">
              {items.map((item) => (
                <CartLineItem
                  key={item.id}
                  image={item.image}
                  title={item.title}
                  variant={item.variant}
                  price={`R${(item.price * item.quantity).toFixed(2)}`}
                  quantity={item.quantity}
                  onQuantityChange={(qty) => updateQuantity(item.id, qty)}
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
                  <span className="text-gray-900">R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="font-medium text-primary-600">Calculate</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span className="text-gray-900">R{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-primary-600">
                    R{total.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">USD (ESTIMATED)</span>
                </div>
              </div>

              <Button fullWidth disabled className="mt-4" icon={<Lock className="h-4 w-4" />}>
                Proceed to Checkout
              </Button>

              <div className="mt-4 flex gap-2 rounded-md bg-gray-50 p-3 text-xs text-gray-500">
                <Info className="h-4 w-4 shrink-0 text-gray-400" />
                Checkout available in a future enhancement. We are currently
                updating our secure payment gateway.
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-6">
              <label htmlFor="promo" className="text-sm font-medium text-gray-900">
                Have a promo code?
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="promo"
                  placeholder="CODE2024"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button variant="secondary">Apply</Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer
        brandBlurb="Premium electronics and design-forward hardware for the modern workspace."
        columns={[
          { title: "Shop", links: [{ label: "Home", href: "/" }, { label: "Catalogue", href: "/catalogue" }, { label: "Categories", href: "/categories" }] },
          { title: "Support", links: [{ label: "Contact", href: "/contact" }, { label: "FAQ", href: "/faq" }, { label: "Shipping", href: "/shipping" }, { label: "Returns", href: "/returns" }] },
          { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }] },
        ]}
      />
    </div>
  );
}