import { getProducts } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import CatalogueClient from "@/src/app/catalogue/CatalogueClient";

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const category = searchParams.category;
  const page = searchParams.page ? Number(searchParams.page) : 1;

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