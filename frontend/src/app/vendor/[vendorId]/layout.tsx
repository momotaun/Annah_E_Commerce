"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRequireVendorStore } from "@/src/hooks/useRequireVendorStore";
import Spinner from "@/src/app/components/ui/Spinner";
import VendorHeader from "@/src/app/components/layout/VendorHeader";

export default function VendorStoreLayout({ children }: { children: React.ReactNode }) {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { vendor, isLoading } = useRequireVendorStore(vendorId);

  if (isLoading || !vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking store access..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <VendorHeader storeName={vendor.businessName} />
      {/* Same stack-then-sidebar pattern as AccountSidebar (customer
          profile): a fixed w-48 side nav had no mobile fallback at all
          here, sitting beside the content at any width and forcing
          horizontal overflow on a phone (verified live). */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 md:flex-row">
        <nav className="flex w-full shrink-0 flex-col gap-1 md:w-48">
          <Link href="/vendor" className="rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-100">
            ← My Stores
          </Link>
          <div className="my-1 border-t border-gray-200" />
          <Link href={`/vendor/${vendorId}/dashboard`} className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href={`/vendor/${vendorId}/products`} className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Products
          </Link>
          <Link href={`/vendor/${vendorId}/orders`} className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Orders
          </Link>
          <Link href={`/vendor/${vendorId}/settings`} className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Settings
          </Link>
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
