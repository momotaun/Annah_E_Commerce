import Link from "next/link";
import Avatar from "@/src/app/components/ui/Avatar";

export interface VendorHeaderProps {
  userName?: string;
  userAvatarSrc?: string;
}

function VendorHeader({ userName = "John Doe", userAvatarSrc }: VendorHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      {/* Logo + avatar alone fit at any width; everything else here
          (the "Vendor Portal" label, Help/Support links, and the name
          next to the avatar) is hidden below sm since the full row
          overflows a mobile-width header (verified live). */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0 text-lg font-bold text-primary-600 sm:text-xl">
            Apex Marketplace
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
          <div className="flex items-center gap-2">
            <Avatar src={userAvatarSrc} alt={userName} size="sm" />
            <span className="hidden text-sm font-medium text-gray-900 sm:block">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default VendorHeader;