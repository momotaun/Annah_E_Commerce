import Link from "next/link";
import Avatar from "@/src/app/components/ui/Avatar";

export interface VendorHeaderProps {
  userName?: string;
  userAvatarSrc?: string;
}

function VendorHeader({ userName = "John Doe", userAvatarSrc }: VendorHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Apex Marketplace
          </Link>
          <span className="h-5 w-px bg-gray-200" />
          <span className="text-sm text-gray-500">Vendor Portal</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/help" className="text-sm text-gray-500 hover:text-primary-600">
            Help Center
          </Link>
          <Link href="/support" className="text-sm text-gray-500 hover:text-primary-600">
            Support
          </Link>
          <div className="flex items-center gap-2">
            <Avatar src={userAvatarSrc} alt={userName} size="sm" />
            <span className="text-sm font-medium text-gray-900">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default VendorHeader;