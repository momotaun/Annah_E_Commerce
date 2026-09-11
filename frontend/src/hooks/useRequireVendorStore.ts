"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/src/hooks/useRequireRole";
import { getMyVendorProfile, VendorProfile } from "@/src/lib/api/vendors";

// Gates a /vendor/[vendorId]/... page on more than "is this user a
// vendor": the store in the URL must actually belong to them and be
// APPROVED. Without this, a hand-edited vendorId would render the portal
// shell before any data call 403s. Redirects to /vendor (the picker), not
// /profile — this is a legitimate vendor, just pointed at the wrong or
// not-yet-ready store.
export function useRequireVendorStore(vendorId: string) {
  const { user, isLoading: roleLoading } = useRequireRole("VENDOR");
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [isCheckingStore, setIsCheckingStore] = useState(true);

  useEffect(() => {
    if (roleLoading || !user) return;
    let cancelled = false;

    getMyVendorProfile(vendorId)
      .then((profile) => {
        if (cancelled) return;
        if (profile.status !== "APPROVED") {
          router.replace("/vendor");
          return;
        }
        setVendor(profile);
      })
      .catch(() => {
        // Not found, not owned, or otherwise inaccessible.
        if (!cancelled) router.replace("/vendor");
      })
      .finally(() => {
        if (!cancelled) setIsCheckingStore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roleLoading, user, vendorId, router]);

  return { vendor, isLoading: roleLoading || isCheckingStore || !vendor };
}
