"use client";

import { useState, FormEvent } from "react";
import { Search } from "lucide-react";
import Input from "@/src/app/components/ui/Input";
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

  return (
    <form onSubmit={handleSubmit} role="search" className={cn("w-full", className)}>
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        icon={<Search className="h-4 w-4" />}
        className={size === "sm" ? "h-9 text-sm" : undefined}
        aria-label="Search"
      />
    </form>
  );
}

export default SearchBar;