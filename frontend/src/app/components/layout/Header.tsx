"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Heart, LogOut, Settings, ShoppingCart, User, X } from "lucide-react";
import Badge from "@/src/app/components/ui/Badge";
import SearchBar from "@/src/app/components/shared/SearchBar";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { cn } from "@/src/lib/utils";

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderProps {
  showSearch?: boolean;
  showCart?: boolean;
  announcementText?: string;
  variant?: "full" | "minimal";
  minimalRightLink?: NavLink;
}

// Mirrors the marketplace's real top-level categories (seeded via the
// backend's CategoriesModule) rather than fetching them, so the header stays
// a lightweight client component with no data dependency of its own.
const categoryLinks: NavLink[] = [
  { label: "Electronics", href: "/categories/electronics" },
  { label: "Home & Living", href: "/categories/home-living" },
  { label: "Fashion", href: "/categories/fashion" },
];

const dealsLink: NavLink = { label: "Deals", href: "/collections/limited-edition" };

function Header({
  showSearch = false,
  showCart = true,
  announcementText,
  variant = "full",
  minimalRightLink,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  function handleSearch(query: string) {
    if (!query) return;
    router.push(`/catalogue?q=${encodeURIComponent(query)}`);
  }

  // Close the mobile menu and the account dropdown on every navigation
  // instead of leaving them open over the new page's content.
  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileMenuOpen(false);
      setAccountMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Dismiss the account dropdown on an outside click or Escape — it has no
  // other close affordance once open.
  useEffect(() => {
    if (!accountMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  function handleLogout() {
    setAccountMenuOpen(false);
    logout();
  }

  const cartLink = (
    <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center text-gray-900">
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center bg-danger-500 px-1 text-white">
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

      <header className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 md:gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-lg font-bold text-white">
            E
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight text-gray-900 sm:inline">
            Elite<span className="text-primary-600">Commerce</span>
          </span>
        </Link>

        {/* Search sits in the middle, using up whatever space the logo and
            icon cluster don't need — there's no separate page-nav row
            competing for width anymore (that's now the category bar below). */}
        {variant === "full" && showSearch && (
          <div className="mx-auto hidden w-full max-w-2xl flex-1 lg:block">
            <SearchBar
              placeholder="Search for products, brands or categories..."
              onSearch={handleSearch}
            />
          </div>
        )}

        {/* Desktop-only icon cluster: hidden below lg — the mobile/tablet
            cluster further down covers the same ground (cart + hamburger)
            without overflowing a narrower header row. */}
        <div className="hidden items-center gap-1 lg:flex">
          {variant === "full" && (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((open) => !open)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                className="flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-gray-900 hover:text-primary-600"
              >
                <User className="h-5 w-5" />
                <span className="text-[11px] font-medium">Account</span>
              </button>

              {accountMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/profile/settings"
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                      >
                        Settings
                      </Link>
                      <div className="my-1 border-t border-gray-200" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-danger-500 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {variant === "full" && (
            <Link
              href="/profile"
              className="flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-gray-900 hover:text-primary-600"
            >
              <Heart className="h-5 w-5" />
              <span className="text-[11px] font-medium">Wishlist</span>
            </Link>
          )}

          {variant === "full" && showCart && (
            <Link
              href="/cart"
              className="relative flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-gray-900 hover:text-primary-600"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -right-2 -top-1.5 h-5 min-w-5 justify-center bg-danger-500 px-1 text-white">
                    {itemCount}
                  </Badge>
                )}
              </div>
              <span className="text-[11px] font-medium">Cart</span>
            </Link>
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

        {/* Mobile/tablet right cluster: cart stays one tap away, everything
            else (search, categories, account) lives behind the hamburger so
            the header row never has to squeeze the full cluster into a
            width that can't fit it. */}
        <div className="ml-auto flex items-center gap-3 lg:hidden">
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

      {/* Category bar: "All Categories" + the top-level categories, with
          Deals called out in the danger colour on the far right. Desktop
          only — the mobile menu below covers the same links. */}
      {variant === "full" && (
        <div className="hidden border-t border-gray-200 lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-sm sm:px-6">
            <div className="flex items-center gap-6">
              <Link
                href="/categories"
                className="flex items-center gap-2 font-bold text-gray-900 hover:text-primary-600"
              >
                <Menu className="h-4 w-4" />
                All Categories
              </Link>
              <div className="h-4 w-px bg-gray-200" />
              <nav className="flex items-center gap-6 font-medium text-gray-900">
                {categoryLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-primary-600">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <Link href={dealsLink.href} className="font-bold text-danger-500 hover:opacity-80">
              {dealsLink.label}
            </Link>
          </div>
        </div>
      )}

      {variant === "full" && mobileMenuOpen && (
        <div className="border-t border-gray-200 px-4 pb-6 pt-4 lg:hidden">
          {showSearch && (
            <div className="mb-4">
              <SearchBar
                placeholder="Search for products, brands or categories..."
                onSearch={handleSearch}
              />
            </div>
          )}

          <nav className="flex flex-col gap-1">
            <Link
              href="/categories"
              className="rounded-md px-3 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              All Categories
            </Link>
            {categoryLinks.map((link) => {
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
            <Link
              href={dealsLink.href}
              className="rounded-md px-3 py-2.5 text-base font-bold text-danger-500 hover:bg-gray-50"
            >
              {dealsLink.label}
            </Link>
          </nav>

          <div className="mt-4 flex flex-col gap-1 border-t border-gray-200 pt-4">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
                <Link
                  href="/profile/settings"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-base font-medium text-danger-500 hover:bg-gray-50"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
              >
                <User className="h-5 w-5" />
                Login
              </Link>
            )}
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              <Heart className="h-5 w-5" />
              Wishlist
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
