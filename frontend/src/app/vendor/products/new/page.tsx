"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import ProductGallery from "@/src/app/components/shared/ProductGallery";
import Input from "@/src/app/components/ui/Input";
import Textarea from "@/src/app/components/ui/Textarea";
import Select from "@/src/app/components/ui/Select";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import Stepper from "@/src/app/components/ui/Stepper";
import { getCategories } from "@/src/lib/api/categories";
import { Category } from "@/src/lib/api-types";
import {
  createVendorProduct,
  uploadVendorProductImage,
} from "@/src/lib/api/vendor-products";
import { formatPrice } from "@/src/lib/utils";

const STEPS = [
  { label: "Basics" },
  { label: "Quantity & Price" },
  { label: "Category" },
  { label: "Images" },
  { label: "Preview" },
];

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export default function NewVendorProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);

    const remainingSlots = MAX_IMAGES - images.length;
    const files = Array.from(fileList).slice(0, remainingSlots);
    if (fileList.length > remainingSlots) {
      setUploadError(`You can add up to ${MAX_IMAGES} images — only the first ${remainingSlots} of your selection were added.`);
    }

    const oversized = files.find((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      setUploadError(`"${oversized.name}" is larger than 5MB. Please choose a smaller image.`);
      return;
    }

    setIsUploading(true);
    try {
      for (const file of files) {
        const { url } = await uploadVendorProductImage(file);
        setImages((prev) => [...prev, url]);
      }
    } catch {
      setUploadError("Couldn't upload one or more images. Image storage may not be configured yet — please try again later.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    setIsSaving(true);
    setSaveError(null);
    try {
      await createVendorProduct({
        name: name.trim(),
        sku: sku.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        description: description.trim() || undefined,
        categoryId,
        images: images.length > 0 ? images : undefined,
        status,
      });
      router.push("/vendor/products");
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

            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((url) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- vendor-supplied, not-yet-optimizable remote URLs */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary-600 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                  <span className="text-xs font-medium">{isUploading ? "Uploading..." : "Add Image"}</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              multiple
              hidden
              onChange={(e) => handleFilesSelected(e.target.files)}
            />

            {uploadError && <p className="mt-4 text-sm text-danger-500">{uploadError}</p>}
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
