"use client";

import Link from "next/link";
import { useRequireRole } from "@/src/hooks/useRequireRole";
import Spinner from "@/src/app/components/ui/Spinner";
import VendorHeader from "@/src/app/components/layout/VendorHeader";

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireRole("VENDOR");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking vendor access..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <VendorHeader />
      {/* Same stack-then-sidebar pattern as AccountSidebar (customer
          profile): a fixed w-48 side nav had no mobile fallback at all
          here, sitting beside the content at any width and forcing
          horizontal overflow on a phone (verified live). */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 md:flex-row">
        <nav className="flex w-full shrink-0 flex-col gap-1 md:w-48">
          <Link href="/vendor/products" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Products
          </Link>
          <Link href="/vendor/orders" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Orders
          </Link>
          <Link href="/vendor/sales-report" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Sales Report
          </Link>
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}