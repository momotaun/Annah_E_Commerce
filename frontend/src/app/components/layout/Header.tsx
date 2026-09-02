"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingCart, X } from "lucide-react";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import Avatar from "@/src/app/components/ui/Avatar";
import SearchBar from "@/src/app/components/shared/SearchBar";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { cn } from "@/src/lib/utils";

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderProps {
  navLinks?: NavLink[];
  showSearch?: boolean;
  showCart?: boolean;
  announcementText?: string;
  variant?: "full" | "minimal";
  minimalRightLink?: NavLink;
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
  showCart = true,
  announcementText,
  variant = "full",
  minimalRightLink,
}: HeaderProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close the mobile menu on every navigation instead of leaving it open
  // over the new page's content.
  useEffect(() => {
    const timer = setTimeout(() => setMobileMenuOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const cartLink = (
    <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center text-gray-900">
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge
          variant="primary"
          className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1"
        >
          {itemCount}
        </Badge>
      )}
    </Link>
  );

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      {announcementText && (
        <div className="bg-primary-600 py-2 text-center text-sm font-medium text-white">
          {announcementText}
        </div>
      )}

      <header className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-bold text-primary-600 sm:text-xl">
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

        {/* Desktop-only right cluster: search, cart, and account. Hidden
            below md — the mobile cluster below covers the same ground
            (cart + hamburger, which opens search/nav/account in a panel)
            without overflowing a narrow header row. */}
        <div className="hidden items-center gap-4 md:flex">
          {variant === "full" && showSearch && (
            <div className="hidden w-56 lg:block">
              <SearchBar size="sm" />
            </div>
          )}

          {variant === "full" && showCart && cartLink}

          {variant === "full" && !isLoading && user && (
            <Link href="/profile">
              <Avatar alt={`${user.firstName} ${user.lastName}`} size="sm" />
            </Link>
          )}

          {variant === "full" && !isLoading && !user && (
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

        {/* Mobile-only right cluster: cart stays one tap away, everything
            else (nav links, search, account) lives behind the hamburger
            so the header row never has to squeeze more than two icons
            into a ~375px width. */}
        <div className="flex items-center gap-3 md:hidden">
          {variant === "full" && showCart && cartLink}

          {variant === "full" && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center text-gray-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
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

      {variant === "full" && mobileMenuOpen && (
        <div className="border-t border-gray-200 px-4 pb-6 pt-4 md:hidden">
          {showSearch && (
            <div className="mb-4">
              <SearchBar size="sm" />
            </div>
          )}

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-gray-200 pt-4">
            {!isLoading && user && (
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
              >
                <Avatar alt={`${user.firstName} ${user.lastName}`} size="sm" />
                My Profile
              </Link>
            )}

            {!isLoading && !user && (
              <Button variant="outline" href="/login" className="w-full">
                Login/Register
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;