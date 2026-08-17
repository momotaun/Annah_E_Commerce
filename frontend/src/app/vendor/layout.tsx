"use client";

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
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        <nav className="flex w-48 shrink-0 flex-col gap-1">
          <a href="/vendor/products" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Products
          </a>
          <a href="/vendor/orders" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Orders
          </a>
          <a href="/vendor/sales-report" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Sales Report
          </a>
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}