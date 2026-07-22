'use client'
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { box: "h-8 w-8", text: "text-xs" },
  md: { box: "h-12 w-12", text: "text-sm" },
  lg: { box: "h-16 w-16", text: "text-lg" },
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  const initials = parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : parts[0]?.slice(0, 2) ?? "";
  return initials.toUpperCase();
}

function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const { box, text } = sizeMap[size];
  const showFallback = !src || imageError;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100",
        box,
        className
      )}
    >
      {showFallback ? (
        <span className={cn("font-semibold text-primary-600", text)}>
          {getInitials(alt)}
        </span>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </span>
  );
}

export default Avatar;