"use client";

import Link from "next/link";
import { useRequireRole } from "@/src/hooks/useRequireRole";
import Spinner from "@/src/app/components/ui/Spinner";
import AccountMenu from "@/src/app/components/layout/AccountMenu";
import Logo from "@/src/app/components/layout/Logo";

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
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-sm text-gray-500">— Admin</span>
          </div>
          <AccountMenu />
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
          <Link href="/admin/branding" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Branding
          </Link>
          <Link href="/admin/banners" className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
            Banners
          </Link>
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}