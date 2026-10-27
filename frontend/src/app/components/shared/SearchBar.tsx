"use client";

import { useState, FormEvent } from "react";
import { Search } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void;
  size?: "sm" | "md";
  // "header" is the white field with a lime button used on the black header.
  tone?: "default" | "header";
  className?: string;
}

function SearchBar({
  placeholder = "Search products...",
  defaultValue = "",
  onSearch,
  size = "md",
  tone = "default",
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch?.(query.trim());
  }

  // The bar uses the brand's 16px card radius (rounded-md, per
  // globals.css) and the action button nests inside it at a smaller 8px
  // radius — a rounded-rectangle-in-a-rounded-rectangle pairing, not a
  // full pill against a square corner. That's why this builds its own
  // input rather than reusing <Input>, which hardcodes a different
  // generic form radius and has no slot for a trailing button.
  return (
    <form onSubmit={handleSubmit} role="search" className={cn("w-full", className)}>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search"
          className={cn(
            "w-full pl-4 pr-12 text-gray-900 placeholder:text-gray-500",
            tone === "header"
              ? "rounded-lg border border-transparent bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime"
              : "rounded-md border border-gray-200 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent",
            size === "sm" ? "h-9 text-sm" : "h-10 text-base"
          )}
        />
        <button
          type="submit"
          aria-label="Search"
          className={cn(
            "absolute right-1 top-1 bottom-1 flex items-center justify-center rounded-lg px-3 transition-colors",
            tone === "header"
              ? "bg-brand-lime text-ink hover:bg-brand-lime-dark"
              : "bg-primary-600 text-white hover:bg-primary-700"
          )}
        >
          <Search className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      </div>
    </form>
  );
}

export default SearchBar;