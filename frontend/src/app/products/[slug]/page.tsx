import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import ProductDetailsClient from "./ProductDetailsClient";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  const [relatedResult, categories] = await Promise.all([
    getProducts({ limit: 4 }),
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

function findCategoryById(categories: Awaited<ReturnType<typeof getCategories>>, id: string) {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    const child = cat.children.find((c) => c.id === id);
    if (child) return child;
  }
  return undefined;
}