import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Category } from "@/src/lib/api-types";
import { getCategoryPath } from "@/src/lib/categoryTree";
import { cn } from "@/src/lib/utils";

export interface CategoryTreeProps {
  categories: Category[];
  /** Slug of the category being viewed, at any depth. */
  activeSlug: string;
}

// The category page's left rail: every top-level category, with the branch
// being viewed expanded level by level down to the active category. Works
// for any depth (Fashion > Men > Tops).
function CategoryTree({ categories, activeSlug }: CategoryTreeProps) {
  const activePath = new Set(getCategoryPath(categories, activeSlug).map((c) => c.slug));

  return (
    <nav aria-label="Categories" className="w-full md:w-56">
      <h2 className="mb-3 text-base font-bold text-ink">Categories</h2>
      <TreeLevel categories={categories} activeSlug={activeSlug} activePath={activePath} depth={0} />
    </nav>
  );
}

function TreeLevel({
  categories,
  activeSlug,
  activePath,
  depth,
}: {
  categories: Category[];
  activeSlug: string;
  activePath: Set<string>;
  depth: number;
}) {
  return (
    <ul className={cn("flex flex-col", depth > 0 && "mb-1 ml-3 border-l border-gray-200 pl-2")}>
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;
        const isExpanded = activePath.has(category.slug) && category.children.length > 0;
        return (
          <li key={category.id}>
            <Link
              href={`/categories/${category.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center justify-between rounded-md px-2 hover:bg-gray-100",
                depth === 0 ? "py-2 text-sm" : "py-1.5 text-sm",
                isActive ? "font-bold text-ink" : depth === 0 ? "text-gray-700" : "text-gray-600"
              )}
            >
              {category.name}
              {category.children.length > 0 && (
                <ChevronRight
                  className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", isExpanded && "rotate-90")}
                />
              )}
            </Link>
            {isExpanded && (
              <TreeLevel
                categories={category.children}
                activeSlug={activeSlug}
                activePath={activePath}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default CategoryTree;
