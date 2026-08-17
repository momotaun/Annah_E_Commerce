"use client";

import { useEffect, useState } from "react";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";
import Spinner from "@/src/app/components/ui/Spinner";
import { getMyVendorProducts, createVendorProduct, VendorProduct } from "@/src/lib/api/vendor-products";
import { getCategories } from "@/src/lib/api/categories";
import { Category } from "@/src/lib/api-types";
import { ApiError } from "@/src/lib/api-client";

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", price: "", categoryId: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleCreate() {
    setIsSaving(true);
    setError(null);
    try {
      const created = await createVendorProduct({
        name: form.name,
        sku: form.sku,
        price: parseFloat(form.price),
        categoryId: form.categoryId,
      });
      setProducts((prev) => [created, ...prev]);
      setShowForm(false);
      setForm({ name: "", sku: "", price: "", categoryId: "" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That SKU is already in use.");
      } else {
        setError("Couldn't create the product. Please check the details.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  const flatCategories = categories.flatMap((c) => [c, ...c.children]);

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
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Product"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

      {showForm && (
        <div className="mt-4 grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-white p-6 sm:grid-cols-2">
          <Input placeholder="Product Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
          <Input placeholder="Price (ZAR)" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          <select
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            className="h-10 rounded-md border border-gray-200 px-3 text-sm"
          >
            <option value="">Select a category</option>
            {flatCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button className="sm:col-span-2" isLoading={isSaving} onClick={handleCreate}>
            Create Product
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">You haven&apos;t listed any products yet.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-500">SKU: {p.sku}</p>
              </div>
              <span className="text-sm font-bold text-primary-600">
                R{Number(p.price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}