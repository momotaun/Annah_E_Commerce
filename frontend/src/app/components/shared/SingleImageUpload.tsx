"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export interface SingleImageUploadProps {
  imageUrl: string | null;
  onChange: (imageUrl: string | null) => void;
  uploadFn: (file: File) => Promise<{ url: string }>;
}

export default function SingleImageUpload({ imageUrl, onChange, uploadFn }: SingleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError(`"${file.name}" is larger than 5MB. Please choose a smaller image.`);
      return;
    }

    setIsUploading(true);
    try {
      const { url } = await uploadFn(file);
      onChange(url);
    } catch {
      setUploadError("Couldn't upload the image. Image storage may not be configured yet — please try again later.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element -- not-yet-optimizable remote URL */}
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary-600 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            <span className="text-[10px] font-medium">{isUploading ? "Uploading..." : "Upload"}</span>
          </button>
        )}

        {imageUrl && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Replace image"}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        hidden
        onChange={(e) => handleFileSelected(e.target.files)}
      />

      {uploadError && <p className="mt-2 text-sm text-danger-500">{uploadError}</p>}
    </div>
  );
}
