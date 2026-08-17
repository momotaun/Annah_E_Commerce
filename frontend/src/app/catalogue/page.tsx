import { getProducts } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import CatalogueClient from "./CatalogueClient";

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;

  const [productsResult, categories] = await Promise.all([
    getProducts({ category, page, limit: 12 }),
    getCategories(),
  ]);

  return (
    <CatalogueClient
      initialProducts={productsResult}
      categories={categories}
      activeCategory={category}
    />
  );
}