import { getProducts, ProductSort } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import CatalogueClient from "./CatalogueClient";

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}) {
  const {
    category,
    page: pageParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    sort: sortParam,
  } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
  const sort =
    sortParam === "price-asc" || sortParam === "price-desc"
      ? (sortParam as ProductSort)
      : undefined;

  const [productsResult, categories] = await Promise.all([
    getProducts({ category, page, minPrice, maxPrice, sort, limit: 12 }),
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
    />
  );
}