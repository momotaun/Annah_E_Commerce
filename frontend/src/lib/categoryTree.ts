import type { Category } from "@/src/lib/api-types";

// Categories nest arbitrarily deep (Fashion > Men > Tops), so everything
// that walks the tree goes through these helpers instead of assuming
// "top level + children".

export function findCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) return category;
    const found = findCategoryBySlug(category.children, slug);
    if (found) return found;
  }
  return undefined;
}

export function findCategoryById(categories: Category[], id: string): Category | undefined {
  for (const category of categories) {
    if (category.id === id) return category;
    const found = findCategoryById(category.children, id);
    if (found) return found;
  }
  return undefined;
}

/** Root-to-node chain for a slug, e.g. [Fashion, Men, Tops]. Empty if unknown. */
export function getCategoryPath(categories: Category[], slug: string): Category[] {
  for (const category of categories) {
    if (category.slug === slug) return [category];
    const rest = getCategoryPath(category.children, slug);
    if (rest.length > 0) return [category, ...rest];
  }
  return [];
}

export interface FlatCategory {
  category: Category;
  depth: number;
  /** "Fashion › Men › Tops" */
  label: string;
}

/** Depth-first flat list, each with its full path label. `maxDepth` counts levels (1 = top level only). */
export function flattenCategoryTree(
  categories: Category[],
  options: { maxDepth?: number } = {},
): FlatCategory[] {
  const maxDepth = options.maxDepth ?? Infinity;
  const result: FlatCategory[] = [];

  function walk(nodes: Category[], depth: number, trail: string[]) {
    for (const node of nodes) {
      const names = [...trail, node.name];
      result.push({ category: node, depth, label: names.join(" › ") });
      if (depth + 1 < maxDepth) walk(node.children, depth + 1, names);
    }
  }

  walk(categories, 0, []);
  return result;
}
