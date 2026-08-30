"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Settings, LogOut } from "lucide-react";
import { cn } from "@/src/lib/utils";

const navItems = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "My Orders", href: "/orders", icon: Package },
  { label: "Settings", href: "/profile/settings", icon: Settings },
];

export interface AccountSidebarProps {
  onLogout?: () => void;
}

function AccountSidebar({ onLogout }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col justify-between md:w-56">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 border-t border-gray-200 pt-4 md:mt-40">
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-900 hover:text-primary-600"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AccountSidebar;