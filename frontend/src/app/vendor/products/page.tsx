"use client";

import { useEffect, useState } from "react";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import Spinner from "@/src/app/components/ui/Spinner";
import { getMyVendorProducts, VendorProduct } from "@/src/lib/api/vendor-products";
import { ApiError } from "@/src/lib/api-client";
import { formatPrice } from "@/src/lib/utils";

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyVendorProducts()
      .then(setProducts)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          setError("Your vendor account isn't approved yet — product management unlocks once an admin approves your application.");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

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
            <div key={p.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                </div>
                <Badge variant={p.status === "PUBLISHED" ? "success" : "outline"}>
                  {p.status === "PUBLISHED" ? "Published" : "Draft"}
                </Badge>
              </div>
              <span className="text-sm font-bold text-primary-600">
                {formatPrice(p.price)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
