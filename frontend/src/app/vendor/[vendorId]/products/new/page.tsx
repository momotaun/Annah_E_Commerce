"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import ProductGallery from "@/src/app/components/shared/ProductGallery";
import ImageUploadGrid from "@/src/app/components/shared/ImageUploadGrid";
import Input from "@/src/app/components/ui/Input";
import Textarea from "@/src/app/components/ui/Textarea";
import Select from "@/src/app/components/ui/Select";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import Stepper from "@/src/app/components/ui/Stepper";
import { getCategories } from "@/src/lib/api/categories";
import { Category } from "@/src/lib/api-types";
import { createVendorProduct } from "@/src/lib/api/vendor-products";
import { formatPrice } from "@/src/lib/utils";

const STEPS = [
  { label: "Basics" },
  { label: "Quantity & Price" },
  { label: "Category" },
  { label: "Images" },
  { label: "Preview" },
];

const MAX_IMAGES = 10;

export default function NewVendorProductPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [basicsError, setBasicsError] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const flatCategories = categories.flatMap((c) => [c, ...c.children]);
  const selectedCategory = flatCategories.find((c) => c.id === categoryId);

  function goNext() {
    if (step === 0) {
      if (!name.trim() || !sku.trim()) {
        setBasicsError("Name and SKU are required to continue.");
        return;
      }
      setBasicsError(null);
    }
    if (step === 1) {
      const parsedPrice = parseFloat(price);
      const parsedQuantity = parseInt(quantity, 10);
      if (!price.trim() || !(parsedPrice > 0) || !quantity.trim() || !(parsedQuantity >= 0) || !Number.isInteger(parsedQuantity)) {
        setInventoryError("A valid quantity and price are required to continue.");
        return;
      }
      setInventoryError(null);
    }
    if (step === 2) {
      if (!categoryId) {
        setCategoryError("Choose a category to continue.");
        return;
      }
      setCategoryError(null);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    setIsSaving(true);
    setSaveError(null);
    try {
      await createVendorProduct(vendorId, {
        name: name.trim(),
        sku: sku.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        description: description.trim() || undefined,
        categoryId,
        images: images.length > 0 ? images : undefined,
        status,
      });
      router.push(`/vendor/${vendorId}/products`);
    } catch {
      setSaveError("Couldn't save this product. Please check the details and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const galleryImages = images.length > 0 ? images : ["/images/placeholder-product.jpg"];

  return (
    <div className="mx-auto max-w-4xl">
      <WizardSteps steps={STEPS} currentStep={step} />

      <div className="mt-10 rounded-md border border-gray-200 bg-white p-8">
        {step === 0 && (
          <div>
            <h1 className="text-xl font-bold text-gray-900">Product Basics</h1>
            <p className="mt-1 text-sm text-gray-500">Tell customers what you&apos;re selling.</p>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">Name</label>
                <Input placeholder="e.g. Apex Silk Pocket Square" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  Description <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <Textarea placeholder="Describe the product..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">SKU</label>
                <Input placeholder="e.g. APEX-SILK-POCKET-SQUARE" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
            </div>

            {basicsError && <p className="mt-4 text-sm text-danger-500">{basicsError}</p>}
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quantity &amp; Price</h1>
            <p className="mt-1 text-sm text-gray-500">How many do you have, and what does it cost?</p>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">Quantity in Stock</label>
                <Input placeholder="e.g. 25" type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">Price (ZAR)</label>
                <Input placeholder="e.g. 349.00" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>

            {inventoryError && <p className="mt-4 text-sm text-danger-500">{inventoryError}</p>}
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold text-gray-900">Category</h1>
            <p className="mt-1 text-sm text-gray-500">Where should this product be listed?</p>

            <div className="mt-6">
              <Select
                placeholder="Select a category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={flatCategories.map((c) => ({ label: c.name, value: c.id }))}
              />
            </div>

            {categoryError && <p className="mt-4 text-sm text-danger-500">{categoryError}</p>}
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-xl font-bold text-gray-900">Images</h1>
            <p className="mt-1 text-sm text-gray-500">Add up to {MAX_IMAGES} images. The first image is used as the cover photo.</p>

            <div className="mt-6">
              <ImageUploadGrid vendorId={vendorId} images={images} onChange={setImages} maxImages={MAX_IMAGES} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-xl font-bold text-gray-900">Preview</h1>
            <p className="mt-1 text-sm text-gray-500">This is roughly how your product will appear to customers.</p>

            <div className="mt-6 grid grid-cols-1 gap-8 rounded-md border border-gray-100 bg-gray-50 p-6 lg:grid-cols-2">
              <ProductGallery images={galleryImages} alt={name || "Product preview"} />

              <div>
                <Badge variant="outline">{selectedCategory?.name ?? "Uncategorized"}</Badge>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">{name || "Untitled Product"}</h2>

                <div className="mt-3 border-t border-gray-200 pt-3">
                  <span className="text-3xl font-bold text-primary-600">{formatPrice(price)}</span>
                </div>

                {description && <p className="mt-3 text-sm text-gray-500">{description}</p>}

                <div className="mt-6 flex gap-4">
                  <Stepper value={1} onChange={() => {}} />
                  <Button fullWidth disabled>
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>

            {saveError && <p className="mt-4 text-sm text-danger-500">{saveError}</p>}

            <div className="mt-8 flex items-center justify-end gap-3">
              <Button variant="outline" isLoading={isSaving} onClick={() => handleSave("DRAFT")}>
                Save as Draft
              </Button>
              <Button isLoading={isSaving} onClick={() => handleSave("PUBLISHED")}>
                Publish
              </Button>
            </div>
          </div>
        )}

        {step < 4 && (
          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={goBack} disabled={step === 0}>
              Back
            </Button>
            <Button onClick={goNext}>Continue →</Button>
          </div>
        )}
        {step === 4 && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={goBack}>
              ← Back to Images
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
