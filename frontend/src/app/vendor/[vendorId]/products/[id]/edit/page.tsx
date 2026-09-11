"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/src/app/components/ui/Input";
import Textarea from "@/src/app/components/ui/Textarea";
import Select from "@/src/app/components/ui/Select";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import Spinner from "@/src/app/components/ui/Spinner";
import ImageUploadGrid from "@/src/app/components/shared/ImageUploadGrid";
import { getCategories } from "@/src/lib/api/categories";
import { Category } from "@/src/lib/api-types";
import {
  ArchiveReason,
  getMyVendorProducts,
  updateVendorProduct,
  VendorProduct,
} from "@/src/lib/api/vendor-products";

const MAX_IMAGES = 10;

const ARCHIVE_REASON_LABELS: Record<ArchiveReason, string> = {
  TEMPORARY: "Temporary",
  OUT_OF_STOCK: "Out of Stock",
  PRODUCT_PROBLEM: "Product Problem",
  DAMAGES: "Damages",
};

export default function EditVendorProductPage() {
  const params = useParams<{ vendorId: string; id: string }>();
  const { vendorId, id } = params;
  const router = useRouter();

  const [product, setProduct] = useState<VendorProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [images, setImages] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMyVendorProducts(vendorId), getCategories()])
      .then(([products, cats]) => {
        setCategories(cats);
        const match = products.find((p) => p.id === id);
        if (!match) {
          setNotFound(true);
          return;
        }
        setProduct(match);
        setName(match.name);
        setDescription(match.description ?? "");
        setSku(match.sku);
        setPrice(match.price);
        setQuantity(String(match.quantity));
        setCategoryId(match.categoryId);
        setStatus(match.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
        setImages(match.images);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [vendorId, id]);

  const flatCategories = categories.flatMap((c) => [c, ...c.children]);

  async function handleSave() {
    if (!product) return;
    setError(null);

    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseInt(quantity, 10);
    if (!name.trim() || !sku.trim() || !(parsedPrice > 0) || !(parsedQuantity >= 0) || !categoryId) {
      setError("Name, SKU, a valid price, a valid quantity, and a category are all required.");
      return;
    }

    setIsSaving(true);
    try {
      await updateVendorProduct(vendorId, product.id, {
        name: name.trim(),
        description: description.trim(),
        sku: sku.trim(),
        price: parsedPrice,
        quantity: parsedQuantity,
        categoryId,
        images,
        imageUrl: images[0],
        status,
      });
      router.push(`/vendor/${vendorId}/products`);
    } catch {
      setError("Couldn't save these changes. Please check the details and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading product..." />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div>
        <p className="text-sm text-gray-500">That product couldn&apos;t be found.</p>
        <Link href={`/vendor/${vendorId}/products`} className="mt-4 inline-block text-sm font-medium text-primary-600">
          ← Back to Your Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/vendor/${vendorId}/products`} className="text-sm font-medium text-gray-500 hover:text-gray-900">
        ← Back to Your Products
      </Link>

      <div className="mt-4 rounded-md border border-gray-200 bg-white p-8">
        <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>

        {product.status === "ARCHIVED" && (
          <div className="mt-4 rounded-md border border-danger-50 bg-danger-50 p-4">
            <p className="text-sm font-semibold text-danger-500">
              This product is archived{product.archivedReason ? ` — ${ARCHIVE_REASON_LABELS[product.archivedReason]}` : ""}
            </p>
            {product.archivedDescription && (
              <p className="mt-1 text-sm text-gray-500">{product.archivedDescription}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              It&apos;s hidden from customers. Set the status below to Draft or Published to make it available again.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Description <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">SKU</label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">Quantity in Stock</label>
              <Input type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">Price (ZAR)</label>
              <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">Category</label>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={flatCategories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">Status</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
              options={[
                { label: "Draft", value: "DRAFT" },
                { label: "Published", value: "PUBLISHED" },
              ]}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">Images</label>
            <ImageUploadGrid vendorId={vendorId} images={images} onChange={setImages} maxImages={MAX_IMAGES} />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

        <div className="mt-8 flex items-center justify-between">
          <Badge variant={status === "PUBLISHED" ? "success" : "outline"}>
            {status === "PUBLISHED" ? "Published" : "Draft"}
          </Badge>
          <Button isLoading={isSaving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
