import { notFound } from "next/navigation";
import { getProducts } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import CategoryClient from "./CategoryClient";

function findCategoryBySlug(categories: Awaited<ReturnType<typeof getCategories>>, slug: string) {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    const child = cat.children.find((c) => c.slug === slug);
    if (child) return child;
  }
  return undefined;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const categories = await getCategories();
  const category = findCategoryBySlug(categories, slug);

  if (!category) {
    notFound();
  }

  const page = pageParam ? Number(pageParam) : 1;
  const productsResult = await getProducts({ category: slug, page, limit: 12 });

  return (
    <CategoryClient category={category} categories={categories} products={productsResult} />
  );
}