"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import Avatar from "@/src/app/components/ui/Avatar";
import SearchBar from "@/src/app/components/shared/SearchBar";
import { cn } from "@/src/lib/utils";

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderProps {
  navLinks?: NavLink[];
  showSearch?: boolean;
  showAuthButton?: boolean;
  cartCount?: number;
  announcementText?: string;
  variant?: "full" | "minimal";
  minimalRightLink?: NavLink;
  user?: { name: string; avatarSrc?: string; href?: string };
}

const defaultNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function Header({
  navLinks = defaultNavLinks,
  showSearch = false,
  showAuthButton = true,
  cartCount,
  announcementText,
  variant = "full",
  minimalRightLink,
  user,
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      {announcementText && (
        <div className="bg-primary-600 py-2 text-center text-sm font-medium text-white">
          {announcementText}
        </div>
      )}

      <header className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="shrink-0 text-xl font-bold text-primary-600">
          Apex Marketplace
        </Link>

        {variant === "full" && (
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary-600",
                    isActive ? "text-primary-600 underline underline-offset-4" : "text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {variant === "full" && showSearch && (
            <div className="hidden w-56 lg:block">
              <SearchBar size="sm" />
            </div>
          )}

          {variant === "full" && cartCount !== undefined && (
            <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center text-gray-900">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="primary"
                  className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1"
                >
                  {cartCount}
                </Badge>
              )}
            </Link>
          )}

          {variant === "full" && user && (
            <Link href={user.href ?? "/profile"}>
              <Avatar src={user.avatarSrc} alt={user.name} size="sm" />
            </Link>
          )}

          {variant === "full" && !user && showAuthButton && (
            <Button variant="outline" size="sm" href="/login">
              Login/Register
            </Button>
          )}

          {variant === "minimal" && minimalRightLink && (
            <Link
              href={minimalRightLink.href}
              className="text-sm font-medium text-gray-900 hover:text-primary-600"
            >
              {minimalRightLink.label}
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}

export default Header;