"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import Spinner from "@/src/app/components/ui/Spinner";
import Select from "@/src/app/components/ui/Select";
import Textarea from "@/src/app/components/ui/Textarea";
import {
  archiveVendorProduct,
  ArchiveReason,
  getMyVendorProducts,
  VendorProduct,
} from "@/src/lib/api/vendor-products";
import { getCategories } from "@/src/lib/api/categories";
import { Category } from "@/src/lib/api-types";
import { ApiError } from "@/src/lib/api-client";
import { formatPrice } from "@/src/lib/utils";

const ARCHIVE_REASON_OPTIONS: { label: string; value: ArchiveReason }[] = [
  { label: "Temporary", value: "TEMPORARY" },
  { label: "Out of Stock", value: "OUT_OF_STOCK" },
  { label: "Product Problem", value: "PRODUCT_PROBLEM" },
  { label: "Damages", value: "DAMAGES" },
];

const ARCHIVE_REASON_LABELS: Record<ArchiveReason, string> = {
  TEMPORARY: "Temporary",
  OUT_OF_STOCK: "Out of Stock",
  PRODUCT_PROBLEM: "Product Problem",
  DAMAGES: "Damages",
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<VendorProduct | null>(null);

  useEffect(() => {
    Promise.all([getMyVendorProducts(), getCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          setError("Your vendor account isn't approved yet — product management unlocks once an admin approves your application.");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categoryNameById = new Map(
    categories.flatMap((c) => [c, ...c.children]).map((c) => [c.id, c.name]),
  );

  function handleArchived(updated: VendorProduct) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setRemoveTarget(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading your products..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Products</h1>
        <Button size="sm" href="/vendor/products/new">
          + Add Product
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

      <div className="mt-6 flex flex-col gap-3">
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">You haven&apos;t listed any products yet.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-md border border-gray-200 bg-white p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={p.imageUrl ?? "/images/placeholder-product.jpg"}
                  alt={p.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <Badge
                    variant={
                      p.status === "PUBLISHED" ? "success" : p.status === "ARCHIVED" ? "danger" : "outline"
                    }
                  >
                    {p.status === "PUBLISHED" ? "Published" : p.status === "ARCHIVED" ? "Archived" : "Draft"}
                    {p.status === "ARCHIVED" && p.archivedReason ? ` · ${ARCHIVE_REASON_LABELS[p.archivedReason]}` : ""}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  SKU: {p.sku}
                  {categoryNameById.get(p.categoryId) && ` · ${categoryNameById.get(p.categoryId)}`}
                </p>
                <p className={`mt-0.5 text-xs font-medium ${p.quantity > 0 ? "text-gray-500" : "text-danger-500"}`}>
                  {p.quantity > 0 ? `${p.quantity} in stock` : "Out of stock"}
                </p>
              </div>

              <span className="shrink-0 text-sm font-bold text-primary-600">{formatPrice(p.price)}</span>

              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" variant="outline" href={`/vendor/products/${p.id}/edit`}>
                  Edit
                </Button>
                {p.status !== "ARCHIVED" && (
                  <Button size="sm" variant="ghost" onClick={() => setRemoveTarget(p)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {removeTarget && (
        <RemoveProductDialog
          product={removeTarget}
          onCancel={() => setRemoveTarget(null)}
          onArchived={handleArchived}
        />
      )}
    </div>
  );
}

function RemoveProductDialog({
  product,
  onCancel,
  onArchived,
}: {
  product: VendorProduct;
  onCancel: () => void;
  onArchived: (updated: VendorProduct) => void;
}) {
  const [reason, setReason] = useState<ArchiveReason>("TEMPORARY");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await archiveVendorProduct(product.id, {
        reason,
        description: description.trim() || undefined,
      });
      onArchived(updated);
    } catch {
      setError("Couldn't remove this product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Remove &ldquo;{product.name}&rdquo; from your store?</h2>
        <p className="mt-1 text-sm text-gray-500">
          It will be hidden from customers immediately. You can find it again later by editing it.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">Reason</label>
            <Select
              value={reason}
              onChange={(e) => setReason(e.target.value as ArchiveReason)}
              options={ARCHIVE_REASON_OPTIONS}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Description <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <Textarea
              placeholder="Add any details about why this product is being removed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={isSubmitting} onClick={handleConfirm}>
            Remove Product
          </Button>
        </div>
      </div>
    </div>
  );
}
