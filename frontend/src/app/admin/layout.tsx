"use client";

import Link from "next/link";
import { useRequireRole } from "@/src/hooks/useRequireRole";
import Spinner from "@/src/app/components/ui/Spinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireRole("ADMIN");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking admin access..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-bold text-primary-600">Apex Marketplace — Admin</span>
        </div>
      </header>

      {/* Same stack-then-sidebar pattern as AccountSidebar (customer
          profile) / the vendor dashboard layout: a fixed w-48 side nav
          had no mobile fallback, sitting beside the content at any
          width and forcing horizontal overflow on a phone. */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8 md:flex-row">
        <nav className="flex w-full shrink-0 flex-col gap-1 md:w-48">
          <Link href="/admin/vendors" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Vendors
          </Link>
          <Link href="/admin/orders" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Orders
          </Link>
          <Link href="/admin/analytics" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Analytics
          </Link>
          <Link href="/admin/legal-pages" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Legal Pages
          </Link>
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}