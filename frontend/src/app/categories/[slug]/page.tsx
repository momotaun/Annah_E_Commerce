import { notFound } from "next/navigation";
import { getProducts, ProductSort } from "@/src/lib/api/products";
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
  searchParams: Promise<{
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}) {
  const { slug } = await params;
  const {
    page: pageParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    sort: sortParam,
  } = await searchParams;

  const categories = await getCategories();
  const category = findCategoryBySlug(categories, slug);

  if (!category) {
    notFound();
  }

  const page = pageParam ? Number(pageParam) : 1;
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
  const sort =
    sortParam === "price-asc" || sortParam === "price-desc"
      ? (sortParam as ProductSort)
      : undefined;
  const productsResult = await getProducts({
    category: slug,
    page,
    minPrice,
    maxPrice,
    sort,
    limit: 12,
  });

  return (
    <CategoryClient
      category={category}
      categories={categories}
      products={productsResult}
      activeMinPrice={minPrice}
      activeMaxPrice={maxPrice}
      activeSort={sort}
    />
  );
}