import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Category } from "@/src/lib/api-types";
import { cn } from "@/src/lib/utils";

export interface CategoryTreeProps {
  categories: Category[];
  /** Slug of the category being viewed (top-level or a child). */
  activeSlug: string;
}

// The category page's left rail: every top-level category, with the branch
// being viewed expanded to show its sub-categories.
function CategoryTree({ categories, activeSlug }: CategoryTreeProps) {
  return (
    <nav aria-label="Categories" className="w-full md:w-56">
      <h2 className="mb-3 text-base font-bold text-ink">Categories</h2>
      <ul className="flex flex-col">
        {categories.map((category) => {
          const isBranchActive =
            category.slug === activeSlug || category.children.some((child) => child.slug === activeSlug);
          return (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                aria-current={category.slug === activeSlug ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-100",
                  category.slug === activeSlug ? "font-bold text-ink" : "text-gray-700"
                )}
              >
                {category.name}
                {category.children.length > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
              </Link>
              {isBranchActive && category.children.length > 0 && (
                <ul className="mb-1 ml-3 border-l border-gray-200 pl-2">
                  {category.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/categories/${child.slug}`}
                        aria-current={child.slug === activeSlug ? "page" : undefined}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-sm hover:bg-gray-100",
                          child.slug === activeSlug ? "font-bold text-ink" : "text-gray-600"
                        )}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default CategoryTree;
