export interface CategoryNode {
  id: string;
  slug: string;
  parentId: string | null;
}

// Every category slug at or below the given ones in the tree (the slugs
// themselves included). Categories nest arbitrarily deep — Fashion > Men >
// Tops — so filtering a listing by "men" must also match products filed
// under "men-tops", and filtering by "fashion" matches the whole branch.
// Slugs that aren't in the tree are passed through untouched so an unknown
// slug still filters to nothing instead of silently widening.
export function expandToDescendantSlugs(
  categories: CategoryNode[],
  slugs: string[],
): string[] {
  const childrenByParent = new Map<string, CategoryNode[]>();
  for (const category of categories) {
    if (!category.parentId) continue;
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const result = new Set<string>(slugs);

  const queue: CategoryNode[] = [];
  for (const slug of slugs) {
    const node = bySlug.get(slug);
    if (node) queue.push(node);
  }

  while (queue.length > 0) {
    const node = queue.shift()!;
    for (const child of childrenByParent.get(node.id) ?? []) {
      if (!result.has(child.slug)) {
        result.add(child.slug);
        queue.push(child);
      }
    }
  }

  return [...result];
}
