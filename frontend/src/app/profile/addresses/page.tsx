"use client";

import { useEffect, useState } from "react";
import { MapPin, Star } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import AccountSidebar from "@/src/app/components/shared/AccountSidebar";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";
import Spinner from "@/src/app/components/ui/Spinner";
import { useAuth } from "@/src/context/AuthContext";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { getMyAddresses, addMyAddress, setDefaultAddress, Address } from "@/src/lib/api/addresses";

export default function AddressesPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { user, logout } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ line1: "", city: "", province: "", postalCode: "" });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    getMyAddresses()
      .then(setAddresses)
      .finally(() => setIsLoadingAddresses(false));
  }, [authLoading, user]);

  async function handleAddAddress() {
    setIsSavingAddress(true);
    setError(null);
    try {
      const created = await addMyAddress({ ...newAddress, isDefault: addresses.length === 0 });
      setAddresses((prev) => [...prev, created]);
      setShowNewAddressForm(false);
      setNewAddress({ line1: "", city: "", province: "", postalCode: "" });
    } catch {
      setError("Couldn't save that address. Please check the details and try again.");
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function handleSetDefault(addressId: string) {
    setUpdatingId(addressId);
    setError(null);
    try {
      await setDefaultAddress(addressId);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === addressId })));
    } catch {
      setError("Couldn't update your default address. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 md:flex-row">
        <AccountSidebar onLogout={logout} />

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Saved Addresses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your shipping and billing locations for faster checkout.
          </p>

          <div className="mt-8 max-w-xl rounded-md border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Your Addresses</h2>
            </div>

            {isLoadingAddresses ? (
              <div className="flex justify-center py-8">
                <Spinner label="Loading addresses..." />
              </div>
            ) : (
              <>
                {addresses.length === 0 && !showNewAddressForm && (
                  <p className="mt-4 text-sm text-gray-500">
                    You haven&apos;t saved any addresses yet.
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-gray-200 p-4"
                    >
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{addr.line1}</p>
                        <p className="text-gray-500">
                          {addr.city}, {addr.province}, {addr.postalCode}
                        </p>
                      </div>
                      {addr.isDefault ? (
                        <Badge variant="primary" icon={<Star className="h-3 w-3" />}>
                          Default
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={updatingId === addr.id}
                          onClick={() => handleSetDefault(addr.id)}
                        >
                          Set as default
                        </Button>
                      )}
                    </div>
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

                {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
