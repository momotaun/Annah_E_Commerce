"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/src/lib/api-types";
import { getCategoryTheme } from "@/src/lib/categoryTheme";

// Photos for the real, seeded categories (both top-level and their
// children) — anything without an entry here falls back to the category's
// soft theme colour rather than breaking.
const CATEGORY_IMAGES: Record<string, string> = {
  electronics: "/images/cat-electronics.jpg",
  computing: "/images/apex-mini-desktop-tower.jpg",
  audio: "/images/apex-elite-wireless-headphones.jpg",
  "home-living": "/images/cat-home.jpg",
  fashion: "/images/cat-fashion.jpg",
};

interface CarouselTile {
  id: string;
  slug: string;
  name: string;
  href: string;
  highlight?: boolean;
}

const SPECIAL_OFFERS_TILE: CarouselTile = {
  id: "special-offers",
  slug: "special-offers",
  name: "Special Offers",
  href: "/collections/limited-edition",
  highlight: true,
};

function CategoryCarousel({ categories }: { categories: Category[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function updateScrollState() {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories]);

  if (categories.length === 0) {
    return null;
  }

  // Every top-level category, immediately followed by its own children, so
  // shoppers can jump straight into a sub-category (e.g. Computing, Audio)
  // without the extra hop through its parent.
  const tiles: CarouselTile[] = categories.flatMap((category) => [
    { id: category.id, slug: category.slug, name: category.name, href: `/categories/${category.slug}` },
    ...category.children.map((child) => ({
      id: child.id,
      slug: child.slug,
      name: child.name,
      href: `/categories/${child.slug}`,
    })),
  ]);
  tiles.push(SPECIAL_OFFERS_TILE);

  function scrollByPage(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * scrollerRef.current.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="relative">
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll categories left"
          className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 py-1"
        >
          {tiles.map((tile) => {
            const image = CATEGORY_IMAGES[tile.slug];
            const theme = getCategoryTheme(tile.slug);
            return (
              <Link
                key={tile.id}
                href={tile.href}
                className="group flex w-20 shrink-0 snap-start flex-col items-center gap-3"
              >
                <span className="relative block h-16 w-16 overflow-hidden rounded-lg transition-transform group-hover:scale-[1.03]">
                  {image || tile.highlight ? (
                    <Image
                      src={image ?? "/images/cat-outdoor.jpg"}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className={`flex h-full w-full items-center justify-center ${theme.bgSoft}`} />
                  )}
                </span>
                <span
                  className={`text-center text-sm font-medium ${tile.highlight ? "text-danger-500" : "text-gray-900"}`}
                >
                  {tile.name}
                </span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollByPage(1)}
          disabled={!canScrollRight}
          aria-label="Scroll categories right"
          className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

export default CategoryCarousel;
