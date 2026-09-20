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
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    segment?: string;
    delivery?: string;
    minRating?: string;
    verifiedOnly?: string;
  }>;
}) {
  const { slug } = await params;
  const {
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    sort: sortParam,
    segment,
    delivery,
    minRating: minRatingParam,
    verifiedOnly: verifiedOnlyParam,
  } = await searchParams;

  const categories = await getCategories();
  const category = findCategoryBySlug(categories, slug);

  if (!category) {
    notFound();
  }

  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
  const sort =
    sortParam === "price-asc" || sortParam === "price-desc"
      ? (sortParam as ProductSort)
      : undefined;
  const minRating = minRatingParam ? Number(minRatingParam) : undefined;
  const verifiedOnly = verifiedOnlyParam === "true";
  // Infinite scroll always starts from the first page on a real
  // navigation — CategoryClient's IntersectionObserver takes over from
  // here, fetching subsequent pages itself as the user scrolls.
  const productsResult = await getProducts({
    category: slug,
    page: 1,
    minPrice,
    maxPrice,
    sort,
    segment,
    delivery,
    minRating,
    verifiedOnly,
    limit: 12,
  });

  return (
    <CategoryClient
      category={category}
      categories={categories}
      initialProducts={productsResult}
      activeMinPrice={minPrice}
      activeMaxPrice={maxPrice}
      activeSort={sort}
      activeSegments={segment ? segment.split(",") : []}
      activeDelivery={delivery ? delivery.split(",") : []}
      activeMinRating={minRating}
      activeVerifiedOnly={verifiedOnly}
    />
  );
}