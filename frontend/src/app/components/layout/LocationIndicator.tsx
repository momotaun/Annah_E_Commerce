"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Check, MapPin, Plus } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { Address, addMyAddress, getMyAddresses, setDefaultAddress } from "@/src/lib/api/addresses";
import { withLoginRedirect } from "@/src/lib/loginRedirect";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";

const FALLBACK_LOCATION = "Delivering to South Africa";

// Nominatim (OpenStreetMap) — free, no API key, and CORS-enabled for
// browser calls. Only used to turn browser geolocation coordinates into a
// city name; never given more than the rounded coordinates it needs for that.
async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.address?.city ?? data.address?.town ?? data.address?.village ?? data.address?.suburb ?? null;
}

function addressLabel(address: Address) {
  return `Delivering to ${address.city}, ${address.province}`;
}

const emptyAddressForm = { line1: "", city: "", province: "", postalCode: "" };

function LocationIndicator() {
  const { user } = useAuth();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const [location, setLocation] = useState(FALLBACK_LOCATION);
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddressForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve the banner text once on mount and whenever auth state changes —
  // a signed-in shopper's saved default address is the accurate,
  // zero-permission-prompt source; the browser's own geolocation (which
  // does prompt) is only a fallback for everyone else. Header keys this
  // component by user id, so a login/logout remounts it (and resets
  // `location` back to FALLBACK_LOCATION) instead of this effect having to
  // setState synchronously on every run.
  useEffect(() => {
    let cancelled = false;

    async function resolveFromSavedAddress() {
      if (!user) return false;
      try {
        const result = await getMyAddresses();
        if (cancelled) return true;
        setAddresses(result);
        const primary = result.find((a) => a.isDefault) ?? result[0];
        if (primary) {
          setLocation(addressLabel(primary));
          return true;
        }
      } catch {
        // Request failed — fall through to geolocation instead of
        // leaving the banner blank.
      }
      return false;
    }

    function resolveFromBrowser() {
      if (typeof navigator === "undefined" || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const city = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            if (city && !cancelled) setLocation(`Delivering to ${city}`);
          } catch {
            // Reverse geocoding failed — keep the fallback text already showing.
          }
        },
        () => {
          // Permission denied, unsupported, or timed out — keep the fallback.
        },
        { timeout: 8000, maximumAge: 10 * 60 * 1000 }
      );
    }

    resolveFromSavedAddress().then((found) => {
      if (!found && !cancelled) resolveFromBrowser();
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Dismiss on an outside click or Escape, matching the header's account
  // dropdown — this is the same kind of anchored popover, not a full modal.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function openPopup() {
    setError(null);
    setIsOpen((open) => !open);
    if (user && addresses === null) {
      setIsLoadingAddresses(true);
      try {
        const result = await getMyAddresses();
        setAddresses(result);
        if (result.length === 0) setShowNewAddressForm(true);
      } catch {
        setError("Couldn't load your saved addresses.");
      } finally {
        setIsLoadingAddresses(false);
      }
    }
  }

  async function handleSelectAddress(address: Address) {
    if (address.isDefault) {
      setLocation(addressLabel(address));
      setIsOpen(false);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const updated = await setDefaultAddress(address.id);
      setAddresses((prev) => prev?.map((a) => ({ ...a, isDefault: a.id === updated.id })) ?? prev);
      setLocation(addressLabel(updated));
      setIsOpen(false);
    } catch {
      setError("Couldn't update your delivery address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddAddress() {
    const { line1, city, province, postalCode } = newAddress;
    if (!line1 || !city || !province || !postalCode) return;
    setIsSaving(true);
    setError(null);
    try {
      const created = await addMyAddress({ ...newAddress, isDefault: true });
      setAddresses((prev) => [created, ...(prev ?? []).map((a) => ({ ...a, isDefault: false }))]);
      setLocation(addressLabel(created));
      setShowNewAddressForm(false);
      setNewAddress(emptyAddressForm);
      setIsOpen(false);
    } catch {
      setError("Couldn't save that address. Please check the details and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleUseCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location isn't available in this browser.");
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          if (city) {
            setLocation(`Delivering to ${city}`);
            setIsOpen(false);
          } else {
            setError("Couldn't determine your city from your location.");
          }
        } catch {
          setError("Couldn't determine your location. Please try again.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setError("Location permission was denied.");
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={openPopup}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex cursor-pointer items-center gap-1.5 text-primary-100 hover:text-white hover:underline"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        {location}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Delivery location"
          className="absolute left-0 top-full z-50 mt-2 w-80 rounded-md border border-gray-200 bg-white p-4 text-left text-gray-900 shadow-lg"
        >
          <h2 className="text-sm font-bold">Delivery Location</h2>

          {error && <p className="mt-2 text-xs text-danger-500">{error}</p>}

          {user ? (
            <div className="mt-3 flex flex-col gap-2">
              {isLoadingAddresses ? (
                <p className="text-sm text-gray-500">Loading your addresses…</p>
              ) : (
                <>
                  {addresses && addresses.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {addresses.map((address) => (
                        <button
                          key={address.id}
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSelectAddress(address)}
                          className={`flex items-start gap-2 rounded-md border p-2.5 text-left text-sm transition-colors disabled:opacity-60 ${
                            address.isDefault
                              ? "border-primary-600 bg-primary-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mt-0.5 shrink-0">
                            {address.isDefault ? (
                              <Check className="h-4 w-4 text-primary-600" />
                            ) : (
                              <span className="block h-4 w-4 rounded-full border border-gray-300" />
                            )}
                          </span>
                          <span>
                            <span className="block font-medium text-gray-900">{address.line1}</span>
                            <span className="block text-xs text-gray-500">
                              {address.city}, {address.province}, {address.postalCode}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {showNewAddressForm ? (
                    <div className="flex flex-col gap-2 rounded-md border border-gray-200 p-2.5">
                      <Input
                        placeholder="Address Line"
                        value={newAddress.line1}
                        onChange={(e) => setNewAddress((p) => ({ ...p, line1: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-2">
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          isLoading={isSaving}
                          onClick={handleAddAddress}
                          disabled={
                            !newAddress.line1 || !newAddress.city || !newAddress.province || !newAddress.postalCode
                          }
                        >
                          Save Address
                        </Button>
                        {addresses && addresses.length > 0 && (
                          <Button size="sm" variant="ghost" onClick={() => setShowNewAddressForm(false)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={() => setShowNewAddressForm(true)}
                    >
                      Add a new address
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              <p className="text-sm text-gray-500">
                Log in to save a delivery address, or let us use your current location.
              </p>
              <Button size="sm" isLoading={isLocating} onClick={handleUseCurrentLocation}>
                Use my current location
              </Button>
              <Link
                href={withLoginRedirect(pathname ?? "/")}
                onClick={() => setIsOpen(false)}
                className="text-center text-sm font-medium text-primary-600 hover:underline"
              >
                Log in to save an address
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationIndicator;
