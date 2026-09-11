"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadVendorProductImage } from "@/src/lib/api/vendor-products";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export interface ImageUploadGridProps {
  vendorId: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploadGrid({ vendorId, images, onChange, maxImages = 10 }: ImageUploadGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);

    const remainingSlots = maxImages - images.length;
    const files = Array.from(fileList).slice(0, remainingSlots);
    if (fileList.length > remainingSlots) {
      setUploadError(`You can add up to ${maxImages} images — only the first ${remainingSlots} of your selection were added.`);
    }

    const oversized = files.find((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      setUploadError(`"${oversized.name}" is larger than 5MB. Please choose a smaller image.`);
      return;
    }

    setIsUploading(true);
    try {
      const accumulated = [...images];
      for (const file of files) {
        const { url } = await uploadVendorProductImage(vendorId, file);
        accumulated.push(url);
        onChange([...accumulated]);
      }
    } catch {
      setUploadError("Couldn't upload one or more images. Image storage may not be configured yet — please try again later.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    onChange(images.filter((img) => img !== url));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
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

        {images.length < maxImages && (
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
  );
}
