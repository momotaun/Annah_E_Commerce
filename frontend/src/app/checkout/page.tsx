"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";
import Spinner from "@/src/app/components/ui/Spinner";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { useCart } from "@/src/context/CartContext";
import { getMyAddresses, addMyAddress, Address } from "@/src/lib/api/addresses";
import { checkout } from "@/src/lib/api/checkout";
import { ApiError } from "@/src/lib/api-client";

export default function CheckoutPage() {
  const { isLoading: authLoading, user } = useRequireAuth();
  const { cart, isLoading: cartLoading } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ line1: "", city: "", province: "", postalCode: "" });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    getMyAddresses()
      .then((result) => {
        setAddresses(result);
        const defaultAddr = result.find((a) => a.isDefault) ?? result[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        if (result.length === 0) setShowNewAddressForm(true);
      })
      .finally(() => setIsLoadingAddresses(false));
  }, [authLoading, user]);

  async function handleAddAddress() {
    setIsSavingAddress(true);
    setError(null);
    try {
      const created = await addMyAddress({ ...newAddress, isDefault: addresses.length === 0 });
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
      setNewAddress({ line1: "", city: "", province: "", postalCode: "" });
    } catch {
      setError("Couldn't save that address. Please check the details and try again.");
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function handlePlaceOrder() {
    if (!cart || !selectedAddressId) return;
    setIsPlacingOrder(true);
    setError(null);
    try {
      const order = await checkout({ sessionId: cart.sessionId, addressId: selectedAddressId });
      router.push(`/orders/${order.id}/confirmation`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError("Your cart is empty or invalid. Please review your cart and try again.");
      } else {
        setError("Something went wrong placing your order. Please try again.");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (authLoading || cartLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading checkout..." />
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
        <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Checkout</h1>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">Your cart is empty.</p>
            <Button href="/catalogue" className="mt-4">Continue Shopping</Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-md border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>

                {isLoadingAddresses ? (
                  <div className="flex justify-center py-8">
                    <Spinner label="Loading addresses..." />
                  </div>
                ) : (
                  <>
                    <div className="mt-4 flex flex-col gap-3">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 ${
                            selectedAddressId === addr.id
                              ? "border-primary-600 bg-primary-50"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1"
                          />
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{addr.line1}</p>
                            <p className="text-gray-500">
                              {addr.city}, {addr.province}, {addr.postalCode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {showNewAddressForm ? (
                      <div className="mt-4 flex flex-col gap-3 rounded-md border border-gray-200 p-4">
                        <Input
                          placeholder="Address Line"
                          value={newAddress.line1}
                          onChange={(e) => setNewAddress((p) => ({ ...p, line1: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                          />
                          <Input
                            placeholder="Province"
                            value={newAddress.province}
                            onChange={(e) => setNewAddress((p) => ({ ...p, province: e.target.value }))}
                          />
                        </div>
                        <Input
                          placeholder="Postal Code"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress((p) => ({ ...p, postalCode: e.target.value }))}
                        />
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            isLoading={isSavingAddress}
                            onClick={handleAddAddress}
                            disabled={!newAddress.line1 || !newAddress.city || !newAddress.province || !newAddress.postalCode}
                          >
                            Save Address
                          </Button>
                          {addresses.length > 0 && (
                            <Button size="sm" variant="ghost" onClick={() => setShowNewAddressForm(false)}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4"
                        onClick={() => setShowNewAddressForm(true)}
                      >
                        + Add a new address
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="rounded-md border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

                <div className="mt-4 flex flex-col gap-2 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-500">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span className="text-gray-900">
                        R{Number(item.lineTotal).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    R{Number(cart?.subtotal ?? 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}

                <Button
                  fullWidth
                  className="mt-4"
                  isLoading={isPlacingOrder}
                  disabled={!selectedAddressId}
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer variant="minimal" />
    </div>
  );
}