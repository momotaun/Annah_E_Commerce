"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import Spinner from "@/src/app/components/ui/Spinner";
import Select from "@/src/app/components/ui/Select";
import Input from "@/src/app/components/ui/Input";
import Textarea from "@/src/app/components/ui/Textarea";
import {
  archiveVendorProduct,
  ArchiveReason,
  getMyVendorProducts,
  ProductStatus,
  VendorProduct,
} from "@/src/lib/api/vendor-products";
import { getCategories } from "@/src/lib/api/categories";
import { Category } from "@/src/lib/api-types";
import { ApiError } from "@/src/lib/api-client";
import { cn, formatPrice } from "@/src/lib/utils";

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

const LOW_STOCK_THRESHOLD = 5;

const STATUS_FILTERS: { label: string; value: "ALL" | ProductStatus }[] = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Archived", value: "ARCHIVED" },
];

type SortKey =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "stock-asc"
  | "stock-desc";

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },
  { label: "Price (Low to High)", value: "price-asc" },
  { label: "Price (High to Low)", value: "price-desc" },
  { label: "Stock (Low to High)", value: "stock-asc" },
  { label: "Stock (High to Low)", value: "stock-desc" },
];

function sortProducts(products: VendorProduct[], key: SortKey): VendorProduct[] {
  const sorted = [...products];
  switch (key) {
    case "oldest":
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return sorted.sort((a, b) => Number(a.price) - Number(b.price));
    case "price-desc":
      return sorted.sort((a, b) => Number(b.price) - Number(a.price));
    case "stock-asc":
      return sorted.sort((a, b) => a.quantity - b.quantity);
    case "stock-desc":
      return sorted.sort((a, b) => b.quantity - a.quantity);
    case "newest":
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<VendorProduct | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProductStatus>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

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

  const statusCounts = useMemo(
    () => ({
      ALL: products.length,
      PUBLISHED: products.filter((p) => p.status === "PUBLISHED").length,
      DRAFT: products.filter((p) => p.status === "DRAFT").length,
      ARCHIVED: products.filter((p) => p.status === "ARCHIVED").length,
    }),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      return true;
    });
    return sortProducts(filtered, sortKey);
  }, [products, search, statusFilter, sortKey]);

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

      {products.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name or SKU..."
                icon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="sm:w-56">
              <Select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  statusFilter === f.value
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:border-primary-600 hover:text-primary-600"
                )}
              >
                {f.label} ({statusCounts[f.value]})
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Showing {visibleProducts.length} of {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3">
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">You haven&apos;t listed any products yet.</p>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-200 py-10 text-center">
            <p className="text-sm text-gray-500">No products match your search or filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="mt-2 text-sm font-medium text-primary-600 hover:underline"
            >
              Clear search and filters
            </button>
          </div>
        ) : (
          visibleProducts.map((p) => (
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
                <p
                  className={cn(
                    "mt-0.5 text-xs font-medium",
                    p.quantity === 0 && "text-danger-500",
                    p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD && "text-warning-500",
                    p.quantity > LOW_STOCK_THRESHOLD && "text-gray-500"
                  )}
                >
                  {p.quantity === 0
                    ? "Out of stock"
                    : p.quantity <= LOW_STOCK_THRESHOLD
                      ? `Low stock — ${p.quantity} left`
                      : `${p.quantity} in stock`}
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
