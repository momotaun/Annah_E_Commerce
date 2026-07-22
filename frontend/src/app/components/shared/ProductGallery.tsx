"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface ProductGalleryProps {
  images: string[];
  alt: string;
}

function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        {images.map((img, i) => (
          <button
            key={img}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative h-20 w-20 overflow-hidden rounded-md border-2 bg-gray-100",
              activeIndex === i ? "border-primary-600" : "border-transparent"
            )}
          >
            <Image src={img} alt={`${alt} thumbnail ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-md bg-gray-100">
        <div className="relative aspect-square w-full">
          <Image src={images[activeIndex]} alt={alt} fill className="object-cover" />
        </div>
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700">
          <ZoomIn className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

export default ProductGallery;