"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Store } from "lucide-react";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import Spinner from "@/src/app/components/ui/Spinner";
import Badge from "@/src/app/components/ui/Badge";
import VendorHeader from "@/src/app/components/layout/VendorHeader";
import Footer from "@/src/app/components/layout/Footer";
import { listMyVendorProfiles, VendorProfile } from "@/src/lib/api/vendors";

const STATUS_BADGE: Record<VendorProfile["status"], "success" | "warning" | "danger"> = {
  APPROVED: "success",
  PENDING: "warning",
  SUSPENDED: "danger",
};

const STATUS_LABEL: Record<VendorProfile["status"], string> = {
  APPROVED: "Approved",
  PENDING: "Pending review",
  SUSPENDED: "Suspended",
};

export default function MyStoresPage() {
  // Login only, not the VENDOR role — a just-submitted PENDING application
  // still leaves the user as CUSTOMER, and they need to land here too (the
  // onboarding "review" step's "Back to My Stores" button sends them here).
  const { user, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [stores, setStores] = useState<VendorProfile[] | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    listMyVendorProfiles().then((all) => {
      // A single approved store is the common case — skip the picker
      // entirely and land straight on its dashboard, same as before this
      // account could own more than one store.
      if (all.length === 1 && all[0].status === "APPROVED") {
        router.replace(`/vendor/${all[0].id}/dashboard`);
        return;
      }
      setStores(all);
    });
  }, [authLoading, user, router]);

  if (authLoading || !user || stores === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading your stores..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <VendorHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">My Stores</h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose a store to manage, or start a new one.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => {
            const isOpenable = store.status === "APPROVED";
            const card = (
              <div className="flex h-full flex-col gap-3 rounded-md border border-gray-200 bg-white p-5 transition-colors group-hover:border-primary-600">
                <div className="flex items-center gap-3">
                  {store.logoUrl ? (
                    <Image
                      src={store.logoUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-sm font-bold text-primary-600">
                      {store.businessName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="min-w-0 truncate text-sm font-semibold text-gray-900">
                    {store.businessName}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE[store.status]} className="w-fit">
                  {STATUS_LABEL[store.status]}
                </Badge>
                {!isOpenable && (
                  <p className="mt-auto text-xs text-gray-500">
                    {store.status === "PENDING"
                      ? "An administrator still needs to approve this application."
                      : "This store's access has been suspended."}
                  </p>
                )}
              </div>
            );

            return isOpenable ? (
              <Link key={store.id} href={`/vendor/${store.id}/dashboard`} className="group">
                {card}
              </Link>
            ) : (
              <div key={store.id}>{card}</div>
            );
          })}

          <Link
            href="/vendor-onboarding/business-info"
            className="flex min-h-[128px] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary-600 hover:text-primary-600"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Add a store</span>
          </Link>
        </div>

        {stores.length === 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Store className="h-4 w-4" />
            You don&apos;t have any stores yet.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
