import Link from "next/link";
import AccountMenu from "@/src/app/components/layout/AccountMenu";
import Logo from "@/src/app/components/layout/Logo";

function VendorHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      {/* Logo + avatar alone fit at any width; everything else here
          (the "Vendor Portal" label, Help/Support links, and the name
          next to the avatar) is hidden below sm since the full row
          overflows a mobile-width header (verified live). */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0">
            <Logo size="sm" />
          </Link>
          <span className="hidden h-5 w-px bg-gray-200 sm:block" />
          <span className="hidden text-sm text-gray-500 sm:block">Vendor Portal</span>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <Link href="/help" className="hidden text-sm text-gray-500 hover:text-primary-600 sm:block">
            Help Center
          </Link>
          <Link href="/support" className="hidden text-sm text-gray-500 hover:text-primary-600 sm:block">
            Support
          </Link>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

export default VendorHeader;