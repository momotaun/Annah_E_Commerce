"use client";

import { useState, FormEvent } from "react";
import { Search } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void;
  size?: "sm" | "md";
  className?: string;
}

function SearchBar({
  placeholder = "Search products...",
  defaultValue = "",
  onSearch,
  size = "md",
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch?.(query.trim());
  }

  // The pill-shaped bar and the square action button intentionally use
  // different corner radii (brand guide: "rounded pill container" for
  // search, distinct from the generic 12px form-input radius) — that's
  // why this builds its own input rather than reusing <Input>, which
  // hardcodes the generic radius and has no slot for a trailing button.
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
            "w-full rounded-full border border-gray-200 bg-primary-50 pl-4 pr-12 text-gray-900 placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent",
            size === "sm" ? "h-9 text-sm" : "h-10 text-base"
          )}
        />
        <button
          type="submit"
          aria-label="Search"
          className={cn(
            "absolute right-1 top-1 bottom-1 flex items-center justify-center rounded-lg bg-primary-600 px-3 text-white transition-colors hover:bg-primary-700"
          )}
        >
          <Search className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      </div>
    </form>
  );
}

export default SearchBar;