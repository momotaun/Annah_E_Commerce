import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import { findCategoryById, getCategoryPath } from "@/src/lib/categoryTree";
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
  const categoryPath = category ? getCategoryPath(categories, category.slug) : [];

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={relatedResult.data.filter((p) => p.id !== product.id).slice(0, 4)}
      categoryName={category?.name ?? "Uncategorized"}
      categorySlug={category?.slug}
      categoryPath={categoryPath.map(({ name, slug }) => ({ name, slug }))}
    />
  );
}
