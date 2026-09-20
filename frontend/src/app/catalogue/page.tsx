import { getProducts, ProductSort, searchProducts } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import CatalogueClient from "./CatalogueClient";

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    q?: string;
    segment?: string;
    delivery?: string;
    minRating?: string;
    verifiedOnly?: string;
  }>;
}) {
  const {
    category,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    sort: sortParam,
    q,
    segment,
    delivery,
    minRating: minRatingParam,
    verifiedOnly: verifiedOnlyParam,
  } = await searchParams;
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
  const sort =
    sortParam === "price-asc" || sortParam === "price-desc"
      ? (sortParam as ProductSort)
      : undefined;
  const minRating = minRatingParam ? Number(minRatingParam) : undefined;
  const verifiedOnly = verifiedOnlyParam === "true";

  // Infinite scroll always starts from the first page on a real
  // navigation — CatalogueClient's IntersectionObserver takes over from
  // here, fetching subsequent pages itself as the user scrolls.
  const [productsResult, categories] = await Promise.all([
    q
      ? searchProducts(q, 1, 20, sort)
      : getProducts({
          category,
          page: 1,
          minPrice,
          maxPrice,
          sort,
          segment,
          delivery,
          minRating,
          verifiedOnly,
          limit: 12,
        }),
    getCategories(),
  ]);

  return (
    <CatalogueClient
      initialProducts={productsResult}
      categories={categories}
      activeCategory={category}
      activeMinPrice={minPrice}
      activeMaxPrice={maxPrice}
      activeSort={sort}
      activeQuery={q}
      activeSegments={segment ? segment.split(",") : []}
      activeDelivery={delivery ? delivery.split(",") : []}
      activeMinRating={minRating}
      activeVerifiedOnly={verifiedOnly}
    />
  );
}