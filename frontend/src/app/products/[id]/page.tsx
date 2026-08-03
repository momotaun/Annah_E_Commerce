import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import ProductDetailsClient from "@/src/components/ProductDetailsClient";

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  let product;
  try {
    product = await getProduct(params.id);
  } catch {
    notFound();
  }

  const [relatedResult, categories] = await Promise.all([
    getProducts({ category: undefined, limit: 4 }), // TODO: filter by same category once we know product.categoryId's slug
    getCategories(),
  ]);

  const category = findCategoryById(categories, product.categoryId);

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={relatedResult.data.filter((p) => p.id !== product.id).slice(0, 4)}
      categoryName={category?.name ?? "Uncategorized"}
    />
  );
}

function findCategoryById(categories: Awaited<ReturnType<typeof getCategories>>, id: string): { name: string } | undefined {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    const child = cat.children.find((c) => c.id === id);
    if (child) return child;
  }
  return undefined;
}