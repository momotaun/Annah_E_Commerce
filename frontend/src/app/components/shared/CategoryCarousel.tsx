"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Percent, Sparkles } from "lucide-react";
import { Category } from "@/src/lib/api-types";
import { getCategoryTheme } from "@/src/lib/categoryTheme";
import { CATEGORY_IMAGES } from "@/src/lib/categoryImages";

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
  name: "Deals",
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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-ink sm:text-2xl">Shop by Category</h2>
        <Link
          href="/categories"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink hover:underline"
        >
          View All Categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
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
                className="group flex w-20 shrink-0 snap-start flex-col items-center gap-2 sm:w-24"
              >
                <span
                  className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full transition-transform group-hover:scale-[1.05] sm:h-20 sm:w-20 ${
                    tile.highlight ? "bg-clearance text-white" : ""
                  }`}
                >
                  {tile.highlight ? (
                    <Percent className="h-8 w-8" strokeWidth={2.5} />
                  ) : image ? (
                    <Image src={image} alt="" fill sizes="80px" className="object-cover" />
                  ) : (
                    <span className={`flex h-full w-full items-center justify-center ${theme.bgSoft}`}>
                      <Sparkles className="h-6 w-6 text-gray-400" />
                    </span>
                  )}
                </span>
                <span
                  className={`text-center text-sm font-medium ${tile.highlight ? "text-clearance" : "text-ink"}`}
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
